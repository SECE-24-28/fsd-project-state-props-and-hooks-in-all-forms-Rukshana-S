const User = require("../Models/UserModel");
const Product = require("../Models/ProductModel");
const Order = require("../Models/OrderModel");

// GET /api/storeadmin/profile
const getStoreProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select("-password");
    res.status(200).json({ success: true, data: admin });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching profile", error: err.message });
  }
};

// PUT /api/storeadmin/profile
const updateStoreProfile = async (req, res) => {
  try {
    const allowed = ["name", "phone", "storeName", "brandName", "profileImage"];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const admin = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
    res.status(200).json({ success: true, message: "Profile updated", data: admin });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed", error: err.message });
  }
};

// GET /api/storeadmin/products
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user.id });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching products", error: err.message });
  }
};

// GET /api/storeadmin/orders
const getMyOrders = async (req, res) => {
  try {
    const myProductIds = await Product.find({ sellerId: req.user.id }).distinct("_id");
    const orders = await Order.find({ "products.productId": { $in: myProductIds } })
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching orders", error: err.message });
  }
};

// GET /api/storeadmin/customers
const getMyCustomers = async (req, res) => {
  try {
    const myProductIds = await Product.find({ sellerId: req.user.id }).distinct("_id");
    const orders = await Order.find({ "products.productId": { $in: myProductIds } })
      .populate("userId", "name email phone createdAt");

    const customerMap = {};
    orders.forEach((o) => {
      if (o.userId) customerMap[o.userId._id] = o.userId;
    });
    res.status(200).json({ success: true, data: Object.values(customerMap) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching customers", error: err.message });
  }
};

// GET /api/storeadmin/analytics
const getStoreAnalytics = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const totalProducts = await Product.countDocuments({ sellerId: req.user.id });

    const analytics = await Order.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      { $match: { "productInfo.sellerId": new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: null,
          uniqueOrders: { $addToSet: "$_id" },
          uniqueCustomers: { $addToSet: "$userId" },
          revenue: {
            $sum: {
              $cond: [
                { $ne: ["$orderStatus", "Cancelled"] },
                { $multiply: ["$products.price", "$products.quantity"] },
                0
              ]
            }
          }
        }
      }
    ]);

    const stats = analytics[0] || { uniqueOrders: [], uniqueCustomers: [], revenue: 0 };

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders: stats.uniqueOrders.length,
        totalRevenue: stats.revenue,
        totalCustomers: stats.uniqueCustomers.length,
      },
    });
  } catch (err) {
    console.error("[StoreAdminController] getStoreAnalytics error:", err.message);
    res.status(500).json({ success: false, message: "Error fetching analytics", error: err.message });
  }
};

module.exports = { getStoreProfile, updateStoreProfile, getMyProducts, getMyOrders, getMyCustomers, getStoreAnalytics };
