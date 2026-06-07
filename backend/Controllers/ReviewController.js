const mongoose = require("mongoose");
const Review = require("../Models/ReviewModel");
const Product = require("../Models/ProductModel");

// GET /api/reviews/:productId
const getProductReviews = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    console.error("[ReviewController] getProductReviews:", err.message);
    res.status(500).json({ success: false, message: "Error fetching reviews", error: err.message });
  }
};

// POST /api/reviews
const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: "productId, rating and comment are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const User = require("../Models/UserModel");
    const userDoc = await User.findById(req.user.id);

    let review = await Review.findOne({ productId, userId: req.user.id });

    if (review) {
      review.rating = Number(rating);
      review.comment = comment;
      review.userName = userDoc?.name || "Customer";
      await review.save();
    } else {
      review = await Review.create({
        productId,
        userId: req.user.id,
        userName: userDoc?.name || "Customer",
        rating: Number(rating),
        comment,
      });
    }

    // Recalculate product rating & review counts
    const reviews = await Review.find({ productId });
    const numOfReviews = reviews.length;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / numOfReviews;

    product.numOfReviews = numOfReviews;
    product.ratings = Number(avgRating.toFixed(1));
    await product.save();

    res.status(201).json({ success: true, message: "Review saved successfully", data: review });
  } catch (err) {
    console.error("[ReviewController] addReview:", err.message);
    res.status(500).json({ success: false, message: "Error saving review", error: err.message });
  }
};

module.exports = { getProductReviews, addReview };
