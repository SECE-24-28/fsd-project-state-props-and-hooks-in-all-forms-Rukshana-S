const express = require("express");
const router = express.Router();
const { addToCart, getCart, updateCartItem, removeFromCart, clearCart } = require("../Controllers/CartController");
const { isUser } = require("../Utils/verifyToken");
const asyncHandler = require("../Middlewares/asyncHandler");

router.post("/", isUser, asyncHandler(addToCart));
router.get("/", isUser, asyncHandler(getCart));
router.delete("/clear", isUser, asyncHandler(clearCart));
router.put("/:id", isUser, asyncHandler(updateCartItem));
router.delete("/:id", isUser, asyncHandler(removeFromCart));

module.exports = router;
