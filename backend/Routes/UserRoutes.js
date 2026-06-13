const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getProfile, updateProfile, forgotPassword, verifyOTP, resetPassword, getApprovedBrands, deleteAccount, getAddresses, addAddress, updateAddress, deleteAddress } = require("../Controllers/UserController");
const { verifyToken } = require("../Utils/verifyToken");
const asyncHandler = require("../Middlewares/asyncHandler");
const { validate, loginRules, registerRules, profileRules } = require("../Middlewares/validationMiddleware");

router.post("/register", validate(registerRules), asyncHandler(registerUser));
router.post("/login",    validate(loginRules), asyncHandler(loginUser));
router.get("/profile",   verifyToken, asyncHandler(getProfile));
router.put("/profile",   verifyToken, validate(profileRules), asyncHandler(updateProfile));
router.delete("/profile", verifyToken, asyncHandler(deleteAccount));
router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/verify-otp", asyncHandler(verifyOTP));
router.post("/reset-password",  asyncHandler(resetPassword));
router.get("/brands", asyncHandler(getApprovedBrands));

router.get("/address", verifyToken, asyncHandler(getAddresses));
router.post("/address", verifyToken, asyncHandler(addAddress));
router.put("/address/:id", verifyToken, asyncHandler(updateAddress));
router.delete("/address/:id", verifyToken, asyncHandler(deleteAddress));

module.exports = router;
