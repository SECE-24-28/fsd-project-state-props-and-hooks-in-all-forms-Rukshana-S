const express = require("express");
const router = express.Router();
const { getProductReviews, addReview } = require("../Controllers/ReviewController");
const { verifyToken } = require("../Utils/verifyToken");

router.get("/:productId", getProductReviews);
router.post("/", verifyToken, addReview);

module.exports = router;
