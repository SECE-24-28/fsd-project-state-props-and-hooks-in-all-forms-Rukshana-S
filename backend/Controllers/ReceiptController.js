const Order = require("../Models/OrderModel");
const mongoose = require("mongoose");

const getReceiptById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid receipt/order ID" });
    }
    const order = await Order.findById(req.params.id).populate("userId", "name email phone");
    if (!order) return res.status(404).json({ success: false, message: "Receipt not found" });
    if (req.user.role === "user" && order.userId && order.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching receipt", error: err.message });
  }
};

module.exports = { getReceiptById };
