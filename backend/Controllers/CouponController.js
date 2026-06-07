const Coupon = require("../Models/CouponModel");

// POST /api/coupons
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, expiryDate, isActive } = req.body;
    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      return res.status(400).json({ success: false, message: "code, discountType, discountValue and expiryDate are required" });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      expiryDate: new Date(expiryDate),
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, message: "Coupon created", data: coupon });
  } catch (err) {
    console.error("[CouponController] createCoupon:", err.message);
    res.status(500).json({ success: false, message: "Error creating coupon", error: err.message });
  }
};

// GET /api/coupons
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: coupons.length, data: coupons });
  } catch (err) {
    console.error("[CouponController] getAllCoupons:", err.message);
    res.status(500).json({ success: false, message: "Error fetching coupons", error: err.message });
  }
};

// POST /api/coupons/apply
const applyCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: "A valid order amount is required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid or inactive coupon code" });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: "Coupon has expired" });
    }

    if (parsedAmount < coupon.minOrderValue) {
      return res.status(400).json({ success: false, message: `Minimum order value to apply this coupon is ₹${coupon.minOrderValue}` });
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (coupon.discountValue / 100) * parsedAmount;
    } else {
      discount = coupon.discountValue;
    }

    // Ensure discount is not greater than original amount
    discount = Math.min(discount, parsedAmount);

    const discountAmountVal = Number(discount.toFixed(2));
    const finalAmountVal = Number((parsedAmount - discount).toFixed(2));

    res.status(200).json({
      success: true,
      discountAmount: discountAmountVal,
      message: "Coupon applied successfully",
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discountAmountVal,
        finalAmount: finalAmountVal,
      }
    });
  } catch (err) {
    console.error("[CouponController] applyCoupon:", err.message);
    res.status(500).json({ success: false, message: "Error applying coupon", error: err.message });
  }
};

// DELETE /api/coupons/:id
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    res.status(200).json({ success: true, message: "Coupon deleted successfully" });
  } catch (err) {
    console.error("[CouponController] deleteCoupon:", err.message);
    res.status(500).json({ success: false, message: "Error deleting coupon", error: err.message });
  }
};

module.exports = { createCoupon, getAllCoupons, applyCoupon, deleteCoupon };
