const express = require("express");
const router = express.Router();
const { createPaymentOrder, verifyPayment } = require("../Controllers/PaymentController");
const { verifyToken } = require("../Utils/verifyToken");
const asyncHandler = require("../Middlewares/asyncHandler");

router.post("/create-order", verifyToken, asyncHandler(createPaymentOrder));
router.post("/verify",       verifyToken, asyncHandler(verifyPayment));

module.exports = router;
