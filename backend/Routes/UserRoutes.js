const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getProfile, updateProfile, forgotPassword, resetPassword, getApprovedBrands } = require("../Controllers/UserController");
const { verifyToken } = require("../Utils/verifyToken");
const asyncHandler = require("../Middlewares/asyncHandler");
const { validate, loginRules, registerRules, profileRules } = require("../Middlewares/validationMiddleware");

router.post("/register", validate(registerRules), asyncHandler(registerUser));
router.post("/login",    validate(loginRules), asyncHandler(loginUser));
router.get("/profile",   verifyToken, asyncHandler(getProfile));
router.put("/profile",   verifyToken, validate(profileRules), asyncHandler(updateProfile));
router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/reset-password",  asyncHandler(resetPassword));
router.get("/brands", asyncHandler(getApprovedBrands));

module.exports = router;
