const express = require("express");
const router = express.Router();
const { getReceiptById } = require("../Controllers/ReceiptController");
const { verifyToken } = require("../Utils/verifyToken");

router.get("/:id", verifyToken, getReceiptById);

module.exports = router;
