const express = require("express");
const router = express.Router();
const { addToCart, getCart, updateCartItem, removeFromCart, clearCart } = require("../Controllers/CartController");
const { isUser } = require("../Utils/verifyToken");

router.post("/", isUser, addToCart);
router.get("/", isUser, getCart);
router.delete("/clear", isUser, clearCart);
router.put("/:id", isUser, updateCartItem);
router.delete("/:id", isUser, removeFromCart);

module.exports = router;
