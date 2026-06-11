const mongoose = require("mongoose");

const SpinSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lastSpinDate: { type: Date, required: true },
    nextSpinDate: { type: Date, required: true },
    weekNumber: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Spin", SpinSchema);
