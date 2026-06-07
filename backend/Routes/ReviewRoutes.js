const express = require("express");
const router = express.Router();
const { getProductReviews, addReview } = require("../Controllers/ReviewController");
const { verifyToken } = require("../Utils/verifyToken");
const asyncHandler = require("../Middlewares/asyncHandler");
const { validate, reviewRules } = require("../Middlewares/validationMiddleware");

router.get("/:productId", asyncHandler(getProductReviews));
router.post("/", verifyToken, validate(reviewRules), asyncHandler(addReview));

module.exports = router;
