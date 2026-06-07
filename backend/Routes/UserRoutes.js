const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getProfile, updateProfile, forgotPassword, resetPassword, getApprovedBrands } = require("../Controllers/UserController");
const { verifyToken } = require("../Utils/verifyToken");

router.post("/register", registerUser);
router.post("/login",    loginUser);
router.get("/profile",   verifyToken, getProfile);
router.put("/profile",   verifyToken, updateProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);
router.get("/brands", getApprovedBrands);

module.exports = router;
