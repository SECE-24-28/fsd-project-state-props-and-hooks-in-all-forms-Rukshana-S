const Coupon = require("../Models/CouponModel");

exports.getMyCoupons = async (req, res) => {
  try {
    const userId = req.user.id;
    const coupons = await Coupon.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error("Error in getMyCoupons:", error);
    res.status(500).json({ success: false, message: "Server error fetching coupons" });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;
    
    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid coupon code" });
    }
    
    if (coupon.used) {
      return res.status(400).json({ success: false, message: "Coupon already used" });
    }
    
    if (coupon.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "This coupon doesn't belong to you" });
    }
    
    let discountPercentage = 0;
    if (coupon.type === "15_OFF") discountPercentage = 15;
    if (coupon.type === "25_OFF") discountPercentage = 25;
    
    return res.status(200).json({
      success: true,
      type: coupon.type,
      discountPercentage
    });
    
  } catch (error) {
    console.error("Error in applyCoupon:", error);
    res.status(500).json({ success: false, message: "Server error applying coupon" });
  }
};
