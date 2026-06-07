const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../Models/OrderModel");
const Product = require("../Models/ProductModel");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID || "rzp_test_SyN7nvYNEU6ojM",
  key_secret: process.env.RAZORPAY_SECRET || "OFqv5uf8GckNN0widblySMBP",
});

// POST /api/payment/create-order
const createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }
    const options = {
      amount: Math.round(Number(amount) * 100), // in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error("[PaymentController] createPaymentOrder:", err.message);
    res.status(500).json({ success: false, message: "Razorpay order creation failed", error: err.message });
  }
};

// POST /api/payment/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment details missing" });
    }

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET || "OFqv5uf8GckNN0widblySMBP");
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // On successful signature verification:
    // Create the order in Atlas and update stock!
    const { products, amount, address } = orderDetails;

    // Verify stock availability first and decrease stock
    for (const item of products) {
      if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ success: false, message: `Invalid product ID format for ${item.name}` });
      }
      const dbProduct = await Product.findById(item.productId);
      if (!dbProduct || dbProduct.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Stock unavailable for product ${item.name}` });
      }
    }

    // Decrease stock
    for (const item of products) {
      const dbProduct = await Product.findById(item.productId);
      dbProduct.stock -= item.quantity;
      if (dbProduct.stock <= 0) {
        dbProduct.stock = 0;
        dbProduct.status = "inactive"; // Out of Stock
      }
      await dbProduct.save();
    }

    const User = require("../Models/UserModel");
    const userDoc = await User.findById(req.user.id);

    const order = await Order.create({
      userId: req.user.id,
      products,
      amount: Number(amount),
      address,
      paymentMethod: "card", // Razorpay card/UPI
      paymentStatus: "paid",
      transactionId: razorpay_payment_id,
      orderStatus: "Pending",
    });

    const Cart = require("../Models/CartModel");
    await Cart.findOneAndDelete({ userId: req.user.id });

    if (userDoc) {
      const sendEmail = require("../Utils/sendEmail");
      sendEmail({
        to: userDoc.email,
        subject: `WEARLY - Order Placed Successfully!`,
        text: `Hello ${userDoc.name},\n\nYour payment was successful and your order has been placed!\n\nOrder ID: ${order._id}\nTotal Amount: ₹${order.amount}\nPayment Method: CARD/UPI (RAZORPAY)\n\nWe will notify you once your order is processed.\n\nBest regards,\nThe WEARLY Team`,
      }).catch(err => console.error("Order payment confirmation email failed:", err.message));
    }

    res.status(201).json({ success: true, message: "Payment verified and order saved", data: order });
  } catch (err) {
    console.error("[PaymentController] verifyPayment:", err.message);
    res.status(500).json({ success: false, message: "Payment verification failed", error: err.message });
  }
};

module.exports = { createPaymentOrder, verifyPayment };
