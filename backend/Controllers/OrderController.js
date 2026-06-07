const Order   = require("../Models/OrderModel");
const Product = require("../Models/ProductModel");
const Notification = require("../Models/NotificationModel");

// Statuses a customer is allowed to cancel from
const CUSTOMER_CANCELLABLE = ["Pending", "Processing", "Confirmed", "Packed"];

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { products, amount, address, paymentMethod } = req.body;
    if (!products || !products.length || !amount || !address) {
      return res.status(400).json({ success: false, message: "products, amount and address are required" });
    }

    // ── 1. Verify stock ──────────────────────────────────────────────────────
    for (const item of products) {
      const dbProduct = await Product.findById(item.productId).populate("sellerId", "storeName brandName name");
      if (!dbProduct || dbProduct.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Stock unavailable for product ${item.name}` });
      }
    }

    // ── 2. Decrease stock + collect enriched items ───────────────────────────
    const enrichedItems = [];
    for (const item of products) {
      const dbProduct = await Product.findById(item.productId).populate("sellerId", "storeName brandName name");
      dbProduct.stock -= item.quantity;

      if (dbProduct.stock <= 0) {
        dbProduct.stock = 0;
        dbProduct.status = "inactive";
        Notification.fire({
          title:   "⚠️ Product Out of Stock",
          message: `"${dbProduct.name}" is now out of stock and has been marked inactive.`,
          role:    "store-admin",
          type:    "stock",
        });
      } else if (dbProduct.stock <= 5) {
        Notification.fire({
          title:   "⚠️ Low Stock Alert",
          message: `"${dbProduct.name}" has only ${dbProduct.stock} unit(s) remaining.`,
          role:    "store-admin",
          type:    "stock",
        });
      }
      await dbProduct.save();

      // Resolve store name from product's sellerId (populated) or product fields
      const seller     = dbProduct.sellerId;
      const storeName  = (seller?.storeName || seller?.brandName || seller?.name || dbProduct.sellerName || dbProduct.brand || "").trim();
      const sellerIdVal = seller?._id || dbProduct.sellerId || null;

      enrichedItems.push({
        productId: item.productId,
        name:      item.name      || dbProduct.name,
        price:     item.price     || dbProduct.price,
        quantity:  item.quantity  || 1,
        image:     item.image     || dbProduct.variants?.[0]?.images?.[0]?.url || "",
        size:      item.size      || "",
        color:     item.color     || "",
        sellerId:  sellerIdVal,
        storeName: storeName,
        brand:     dbProduct.brand || dbProduct.brandName || "",
      });
    }

    // Derive top-level sellerName from first item (single-seller MVP)
    const topSellerName = enrichedItems[0]?.storeName || "";

    const User    = require("../Models/UserModel");
    const userDoc = await User.findById(req.user.id);

    const order = await Order.create({
      userId:        req.user.id,
      products:      enrichedItems,
      amount:        Number(amount),
      address,
      paymentMethod: paymentMethod || "cod",
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      sellerName:    topSellerName,
    });

    const Cart = require("../Models/CartModel");
    await Cart.findOneAndDelete({ userId: req.user.id });

    // Notifications
    Notification.fire({
      title:        "Order Placed Successfully! 🎉",
      message:      `Your order #${order._id.toString().slice(-6).toUpperCase()} of ₹${order.amount.toLocaleString("en-IN")} has been received.`,
      role:         "user",
      type:         "order",
      targetUserId: req.user.id,
    });

    Notification.fire({
      title:   "New Order Received 📦",
      message: `A new order worth ₹${order.amount.toLocaleString("en-IN")} was placed by ${userDoc?.name || "a customer"}.`,
      role:    "super-admin",
      type:    "order",
    });

    if (topSellerName) {
      Notification.fire({
        title:   "New Order Received 📦",
        message: `A new order worth ₹${order.amount.toLocaleString("en-IN")} was placed for your store.`,
        role:    "store-admin",
        type:    "order",
      });
    }

    if (userDoc) {
      const sendEmail = require("../Utils/sendEmail");
      sendEmail({
        to:      userDoc.email,
        subject: "WEARLY - Order Placed Successfully!",
        text:    `Hello ${userDoc.name},\n\nYour order has been placed successfully!\n\nOrder ID: ${order._id}\nTotal Amount: ₹${order.amount}\nPayment Method: ${order.paymentMethod.toUpperCase()}\n\nWe will notify you once your order is processed.\n\nBest regards,\nThe WEARLY Team`,
      }).catch(err => console.error("Order placement email failed:", err.message));
    }

    res.status(201).json({ success: true, message: "Order placed", data: order });
  } catch (err) {
    console.error("[OrderController] createOrder:", err.message);
    res.status(500).json({ success: false, message: "Error placing order", error: err.message });
  }
};

// GET /api/orders
const getOrders = async (req, res) => {
  try {
    const filter = req.user.role === "user" ? { userId: req.user.id } : {};
    const orders = await Order.find(filter)
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    console.error("[OrderController] getOrders:", err.message);
    res.status(500).json({ success: false, message: "Error fetching orders", error: err.message });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID format" });
    }
    const order = await Order.findById(req.params.id).populate("userId", "name email phone");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (req.user.role === "user" && order.userId && order.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error("[OrderController] getOrderById:", err.message);
    res.status(500).json({ success: false, message: "Error fetching order", error: err.message });
  }
};

// PUT /api/orders/:id
const updateOrder = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID format" });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // ── LOCK: nobody can update a cancelled order ────────────────────────────
    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({ success: false, message: "Cannot update a cancelled order" });
    }

    // ── Store Admin rules ────────────────────────────────────────────────────
    if (req.user.role === "store-admin") {
      if (req.body.orderStatus) {
        const allowedStatuses = ["Processing", "Shipped", "Out For Delivery", "Delivered"];
        if (!allowedStatuses.includes(req.body.orderStatus)) {
          return res.status(400).json({
            success: false,
            message: `Store admins can only update status to: ${allowedStatuses.join(", ")}`,
          });
        }
      }
    }

    // ── Customer rules ───────────────────────────────────────────────────────
    if (req.user.role === "user") {
      if (order.userId && order.userId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }
      if (req.body.orderStatus) {
        if (req.body.orderStatus !== "Cancelled") {
          return res.status(403).json({ success: false, message: "Customers can only cancel orders" });
        }
        if (!CUSTOMER_CANCELLABLE.includes(order.orderStatus)) {
          return res.status(400).json({
            success: false,
            message: `Order cannot be cancelled once it is ${order.orderStatus}`,
          });
        }
        order.cancelledBy = "customer";
      }
    }

    // ── Apply updates ────────────────────────────────────────────────────────
    if (req.body.orderStatus) {
      order.orderStatus = req.body.orderStatus;
      order.statusHistory.push({ status: req.body.orderStatus });
    }
    if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
    if (req.body.address)       order.address = req.body.address;

    const updated = await order.save();

    // ── Post-save side-effects ───────────────────────────────────────────────
    if (updated && req.body.orderStatus) {
      const orderIdShort = updated._id.toString().slice(-6).toUpperCase();

      // Fired to Customer
      let customerTitle = `Order Status: ${updated.orderStatus} 📦`;
      let customerMsg = `Your order #${orderIdShort} status is now: ${updated.orderStatus}.`;
      if (updated.orderStatus === "Cancelled") {
        customerTitle = `Order Cancelled ❌`;
        customerMsg = `Your order #${orderIdShort} has been cancelled.`;
      } else if (updated.orderStatus === "Shipped") {
        customerTitle = `Order Shipped 🚚`;
        customerMsg = `Your order #${orderIdShort} has been shipped.`;
      } else if (updated.orderStatus === "Out For Delivery") {
        customerTitle = `Order Out For Delivery 🛵`;
        customerMsg = `Your order #${orderIdShort} is out for delivery.`;
      } else if (updated.orderStatus === "Delivered") {
        customerTitle = `Order Delivered 🎁`;
        customerMsg = `Your order #${orderIdShort} has been delivered successfully.`;
      }

      Notification.fire({
        title: customerTitle,
        message: customerMsg,
        role: "user",
        type: "order",
        targetUserId: updated.userId,
      });

      // Fired to Admin and Store Admin
      let adminTitle = `Order Status: ${updated.orderStatus}`;
      let adminMsg = `Order #${orderIdShort} status updated to: ${updated.orderStatus}.`;
      if (updated.orderStatus === "Cancelled") {
        adminTitle = `Order Cancelled ❌`;
        adminMsg = `Order #${orderIdShort} has been cancelled${req.user.role === "user" ? " by the customer" : ""}.`;
      } else if (updated.orderStatus === "Shipped") {
        adminTitle = `Order Shipped 🚚`;
        adminMsg = `Order #${orderIdShort} has been shipped.`;
      } else if (updated.orderStatus === "Out For Delivery") {
        adminTitle = `Order Out For Delivery 🛵`;
        adminMsg = `Order #${orderIdShort} is out for delivery.`;
      } else if (updated.orderStatus === "Delivered") {
        adminTitle = `Order Delivered 🎁`;
        adminMsg = `Order #${orderIdShort} has been delivered.`;
      }

      // Send to Super Admin
      Notification.fire({
        title: adminTitle,
        message: adminMsg,
        role: "super-admin",
        type: "order",
      });

      // Send to Store Admin
      Notification.fire({
        title: adminTitle,
        message: adminMsg,
        role: "store-admin",
        type: "order",
      });

      const User    = require("../Models/UserModel");
      const userDoc = await User.findById(updated.userId);
      if (userDoc) {
        const sendEmail = require("../Utils/sendEmail");
        sendEmail({
          to:      userDoc.email,
          subject: "WEARLY - Order Status Update",
          text:    `Hello ${userDoc.name},\n\nYour order status has been updated to: ${updated.orderStatus}.\n\nOrder ID: ${updated._id}\n\nThank you for shopping with us!\n\nBest regards,\nThe WEARLY Team`,
        }).catch(err => console.error("Order status update email failed:", err.message));
      }
    }

    res.status(200).json({ success: true, message: "Order updated", data: updated });
  } catch (err) {
    console.error("[OrderController] updateOrder:", err.message);
    res.status(500).json({ success: false, message: "Error updating order", error: err.message });
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrder };
