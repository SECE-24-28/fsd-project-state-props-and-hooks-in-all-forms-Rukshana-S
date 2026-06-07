const User = require("../Models/UserModel");
const Product = require("../Models/ProductModel");
const Order = require("../Models/OrderModel");
const Notification = require("../Models/NotificationModel");

// GET /api/superadmin/applications
const getApplications = async (req, res) => {
  try {
    const applications = await User.find({ role: "store-admin", status: "pending" }).select("-password");
    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching applications", error: err.message });
  }
};

// PUT /api/superadmin/approve/:id
const approveStoreAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const sendEmail = require("../Utils/sendEmail");
    sendEmail({
      to: user.email,
      subject: "WEARLY - Store Application Approved!",
      text: `Hello ${user.name},\n\nCongratulations! Your application to become a Store Admin at WEARLY has been approved. You can now log in to the dashboard and start listing your products.\n\nBest regards,\nThe WEARLY Team`,
    }).catch(err => console.error("Approval email failed:", err.message));

    // Fire in-app notification to the newly approved store admin
    Notification.fire({
      title:        "Application Approved! 🎉",
      message:      "Congratulations! Your store admin application has been approved. You can now access your seller dashboard.",
      role:         "store-admin",
      type:         "approved",
      targetUserId: user._id,
    });

    res.status(200).json({ success: true, message: "Store admin approved", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error approving", error: err.message });
  }
};

// PUT /api/superadmin/reject/:id
const rejectStoreAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const sendEmail = require("../Utils/sendEmail");
    sendEmail({
      to: user.email,
      subject: "WEARLY - Store Application Update",
      text: `Hello ${user.name},\n\nWe regret to inform you that your application to become a Store Admin at WEARLY has been rejected. If you have any questions, please contact our support team.\n\nBest regards,\nThe WEARLY Team`,
    }).catch(err => console.error("Rejection email failed:", err.message));

    // Fire in-app notification to the rejected applicant
    Notification.fire({
      title:        "Application Status Update",
      message:      "Unfortunately your store admin application was not approved at this time. Please contact support for more information.",
      role:         "store-admin",
      type:         "rejected",
      targetUserId: user._id,
    });

    res.status(200).json({ success: true, message: "Store admin rejected", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error rejecting", error: err.message });
  }
};

// GET /api/superadmin/storeadmins
const getAllStoreAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "store-admin" }).select("-password");
    res.status(200).json({ success: true, count: admins.length, data: admins });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching admins", error: err.message });
  }
};

// PUT /api/superadmin/deactivate/:id
const deactivateStoreAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "deactivated" },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, message: "Store admin deactivated", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deactivating", error: err.message });
  }
};

// PUT /api/superadmin/activate/:id
const activateStoreAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, message: "Store admin activated", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error activating", error: err.message });
  }
};

// DELETE /api/superadmin/delete/:id
const deleteStoreAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role === "super-admin") {
      return res.status(403).json({ success: false, message: "Super admin cannot be deleted" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting user", error: err.message });
  }
};

// GET /api/superadmin/analytics
const getGlobalAnalytics = async (req, res) => {
  try {
    const totalUsers    = await User.countDocuments({ role: "user" });
    const totalProducts = await Product.countDocuments();
    const totalOrders   = await Order.countDocuments();

    // Total revenue (non-cancelled)
    const revenueOrders = await Order.find({ orderStatus: { $ne: "Cancelled" } }).lean();
    const totalRevenue  = revenueOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

    // ── Top store by ORDERS ──────────────────────────────────────────────────
    // Group orders by the sellerId stored on the first product item
    const ordersBySellerAgg = await Order.aggregate([
      { $unwind: "$products" },
      { $match: { "products.sellerId": { $ne: null } } },
      { $group: { _id: "$products.sellerId", orderCount: { $sum: 1 } } },
      { $sort: { orderCount: -1 } },
      { $limit: 1 },
    ]);

    let topStoreByOrders = null;
    if (ordersBySellerAgg.length > 0) {
      const seller = await User.findById(ordersBySellerAgg[0]._id).select("name storeName brandName").lean();
      if (seller) {
        topStoreByOrders = {
          store:      seller.storeName || seller.brandName || seller.name || "Store",
          orderCount: ordersBySellerAgg[0].orderCount,
        };
      }
    }
    // Fallback: if sellerId not stored on old orders, group by top-level sellerName
    if (!topStoreByOrders) {
      const byName = await Order.aggregate([
        { $match: { sellerName: { $ne: "", $exists: true } } },
        { $group: { _id: "$sellerName", orderCount: { $sum: 1 } } },
        { $sort: { orderCount: -1 } },
        { $limit: 1 },
      ]);
      if (byName.length > 0) {
        topStoreByOrders = { store: byName[0]._id, orderCount: byName[0].orderCount };
      }
    }

    // ── Top store by REVENUE ─────────────────────────────────────────────────
    const revenueBySellerAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $unwind: "$products" },
      { $match: { "products.sellerId": { $ne: null } } },
      {
        $group: {
          _id:     "$products.sellerId",
          revenue: { $sum: { $multiply: [{ $ifNull: ["$products.price", 0] }, { $ifNull: ["$products.quantity", 1] }] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 1 },
    ]);

    let topStoreByRevenue = null;
    if (revenueBySellerAgg.length > 0) {
      const seller = await User.findById(revenueBySellerAgg[0]._id).select("name storeName brandName").lean();
      if (seller) {
        topStoreByRevenue = {
          store:   seller.storeName || seller.brandName || seller.name || "Store",
          revenue: revenueBySellerAgg[0].revenue,
        };
      }
    }
    // Fallback: group by sellerName stored on order
    if (!topStoreByRevenue) {
      const byName = await Order.aggregate([
        { $match: { orderStatus: { $ne: "Cancelled" }, sellerName: { $ne: "", $exists: true } } },
        { $group: { _id: "$sellerName", revenue: { $sum: "$amount" } } },
        { $sort: { revenue: -1 } },
        { $limit: 1 },
      ]);
      if (byName.length > 0) {
        topStoreByRevenue = { store: byName[0]._id, revenue: byName[0].revenue };
      }
    }

    // ── Top store by PRODUCTS ────────────────────────────────────────────────
    const productsBySellerAgg = await Product.aggregate([
      { $match: { sellerId: { $ne: null } } },
      { $group: { _id: "$sellerId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    let topStoreByProducts = null;
    if (productsBySellerAgg.length > 0) {
      const seller = await User.findById(productsBySellerAgg[0]._id).select("name storeName brandName").lean();
      if (seller) {
        topStoreByProducts = {
          store: seller.storeName || seller.brandName || seller.name || "Store",
          count: productsBySellerAgg[0].count,
        };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        topStoreByOrders,
        topStoreByProducts,
        topStoreByRevenue,
      },
    });
  } catch (err) {
    console.error("[SuperAdmin] getGlobalAnalytics:", err.message);
    res.status(500).json({ success: false, message: "Error fetching analytics", error: err.message });
  }
};

// GET /api/superadmin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching users", error: err.message });
  }
};

// GET /api/superadmin/orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "name email").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching orders", error: err.message });
  }
};

// GET /api/superadmin/products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("sellerId", "name storeName brandName");
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching products", error: err.message });
  }
};

module.exports = {
  getApplications, approveStoreAdmin, rejectStoreAdmin,
  getAllStoreAdmins, deactivateStoreAdmin, activateStoreAdmin, deleteStoreAdmin,
  getGlobalAnalytics, getAllUsers, getAllOrders, getAllProducts,
};
