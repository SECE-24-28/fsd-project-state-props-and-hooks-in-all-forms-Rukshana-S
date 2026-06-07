const express = require("express");
const router = express.Router();
const { addToWishlist, getWishlist, removeFromWishlist } = require("../Controllers/WishlistController");
const { isUser } = require("../Utils/verifyToken");
const asyncHandler = require("../Middlewares/asyncHandler");

router.post("/", isUser, asyncHandler(addToWishlist));
router.get("/", isUser, asyncHandler(getWishlist));
router.delete("/:id", isUser, asyncHandler(removeFromWishlist));

module.exports = router;
