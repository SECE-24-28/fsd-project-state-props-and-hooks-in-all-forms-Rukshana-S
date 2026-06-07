const express = require("express");
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrder } = require("../Controllers/OrderController");
const { isSuperAdmin, isUser } = require("../Utils/verifyToken");
const asyncHandler = require("../Middlewares/asyncHandler");
const { validate, orderRules } = require("../Middlewares/validationMiddleware");

router.post("/", isUser, validate(orderRules), asyncHandler(createOrder));
router.get("/", isUser, asyncHandler(getOrders));
router.get("/:id", isUser, asyncHandler(getOrderById));
router.put("/:id", isUser, asyncHandler(updateOrder));

module.exports = router;
