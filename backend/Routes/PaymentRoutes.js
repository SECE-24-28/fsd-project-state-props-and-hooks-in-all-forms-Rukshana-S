const express = require("express");
const router = express.Router();
const { createPaymentOrder, verifyPayment } = require("../Controllers/PaymentController");
const { verifyToken } = require("../Utils/verifyToken");

router.post("/create-order", verifyToken, createPaymentOrder);
router.post("/verify",       verifyToken, verifyPayment);

module.exports = router;
