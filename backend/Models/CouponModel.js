const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    code:          { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType:  { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    expiryDate:    { type: Date, required: true },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", CouponSchema);
