const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name:      { type: String },
        price:     { type: Number },
        image:     { type: String },
        brand:     { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wishlist", WishlistSchema);
