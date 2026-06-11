const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["15_OFF", "25_OFF", "FREE_SHIPPING"], required: true },
    used: { type: Boolean, default: false },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", CouponSchema);
