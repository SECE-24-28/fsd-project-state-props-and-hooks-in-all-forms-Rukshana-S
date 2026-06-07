const express = require("express");
const router = express.Router();
const {
  getStoreProfile, updateStoreProfile,
  getMyProducts, getMyOrders, getMyCustomers, getStoreAnalytics,
} = require("../Controllers/StoreAdminController");
const { isStoreAdmin } = require("../Utils/verifyToken");

router.get("/profile", isStoreAdmin, getStoreProfile);
router.put("/profile", isStoreAdmin, updateStoreProfile);
router.get("/products", isStoreAdmin, getMyProducts);
router.get("/orders", isStoreAdmin, getMyOrders);
router.get("/customers", isStoreAdmin, getMyCustomers);
router.get("/analytics", isStoreAdmin, getStoreAnalytics);

module.exports = router;
