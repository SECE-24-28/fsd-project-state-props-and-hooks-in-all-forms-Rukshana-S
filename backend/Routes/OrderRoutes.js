const express = require("express");
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrder } = require("../Controllers/OrderController");
const { isSuperAdmin, isUser } = require("../Utils/verifyToken");

router.post("/", isUser, createOrder);
router.get("/", isUser, getOrders);
router.get("/:id", isUser, getOrderById);
router.put("/:id", isUser, updateOrder);

module.exports = router;
