const express = require("express");
const router = express.Router();
const { addToWishlist, getWishlist, removeFromWishlist } = require("../Controllers/WishlistController");
const { isUser } = require("../Utils/verifyToken");

router.post("/", isUser, addToWishlist);
router.get("/", isUser, getWishlist);
router.delete("/:id", isUser, removeFromWishlist);

module.exports = router;
