const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name:      { type: String },
        price:     { type: Number },
        image:     { type: String },
        selectedImage: { type: String },
        size:      { type: String, default: "" },
        color:     { type: String, default: "" },
        selectedColor: { type: String, default: "" },
        quantity:  { type: Number, default: 1, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
