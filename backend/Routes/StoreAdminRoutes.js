const express = require("express");
const router = express.Router();
const {
  getStoreProfile, updateStoreProfile,
  getMyProducts, getMyOrders, getMyCustomers, getStoreAnalytics,
} = require("../Controllers/StoreAdminController");
const { isStoreAdmin } = require("../Utils/verifyToken");
const asyncHandler = require("../Middlewares/asyncHandler");

router.get("/profile", isStoreAdmin, asyncHandler(getStoreProfile));
router.put("/profile", isStoreAdmin, asyncHandler(updateStoreProfile));
router.get("/products", isStoreAdmin, asyncHandler(getMyProducts));
router.get("/orders", isStoreAdmin, asyncHandler(getMyOrders));
router.get("/customers", isStoreAdmin, asyncHandler(getMyCustomers));
router.get("/analytics", isStoreAdmin, asyncHandler(getStoreAnalytics));

module.exports = router;
