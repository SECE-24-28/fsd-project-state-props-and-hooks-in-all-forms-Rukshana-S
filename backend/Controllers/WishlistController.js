const mongoose = require("mongoose");
const Wishlist = require("../Models/WishlistModel");

// POST /api/wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId, name, price, image, brand } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId: req.user.id,
        products: [{ productId, name, price, image, brand }],
      });
      return res.status(201).json({ success: true, message: "Added to wishlist", data: wishlist });
    }

    const exists = wishlist.products.find((p) => p.productId && p.productId.toString() === productId);
    if (exists) {
      return res.status(409).json({ success: false, message: "Product already in wishlist" });
    }

    wishlist.products.push({ productId, name, price, image, brand });
    await wishlist.save();
    res.status(200).json({ success: true, message: "Added to wishlist", data: wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating wishlist", error: err.message });
  }
};

// GET /api/wishlist
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id }).populate("products.productId", "name price variants");
    if (!wishlist) return res.status(200).json({ success: true, data: { products: [] } });

    // Clean up products that no longer exist to prevent frontend crashes
    const initialLen = wishlist.products.length;
    wishlist.products = wishlist.products.filter(p => p.productId !== null);
    if (wishlist.products.length !== initialLen) {
      await wishlist.save();
    }

    res.status(200).json({ success: true, data: wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching wishlist", error: err.message });
  }
};

// DELETE /api/wishlist/:id  — remove item by wishlist item _id
const removeFromWishlist = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid wishlist item ID format" });
    }

    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) return res.status(404).json({ success: false, message: "Wishlist not found" });

    wishlist.products = wishlist.products.filter((p) => p._id.toString() !== req.params.id);
    await wishlist.save();
    res.status(200).json({ success: true, message: "Removed from wishlist", data: wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error removing item", error: err.message });
  }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist };
