const express = require("express");
const router = express.Router();
const { getSpinStatus, performSpin } = require("../Controllers/spinController");
const { verifyToken } = require("../Utils/verifyToken");
const asyncHandler = require("../Middlewares/asyncHandler");

router.get("/status", verifyToken, asyncHandler(getSpinStatus));
router.post("/", verifyToken, asyncHandler(performSpin));

module.exports = router;
