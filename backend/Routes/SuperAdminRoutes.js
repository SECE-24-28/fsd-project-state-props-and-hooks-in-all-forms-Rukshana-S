const express = require("express");
const router = express.Router();
const {
  getApplications, approveStoreAdmin, rejectStoreAdmin,
  getAllStoreAdmins, deactivateStoreAdmin, activateStoreAdmin, deleteStoreAdmin,
  getGlobalAnalytics, getAllUsers, getAllOrders, getAllProducts,
} = require("../Controllers/SuperAdminController");
const { isSuperAdmin } = require("../Utils/verifyToken");

router.get("/applications", isSuperAdmin, getApplications);
router.put("/approve/:id", isSuperAdmin, approveStoreAdmin);
router.put("/reject/:id", isSuperAdmin, rejectStoreAdmin);

router.get("/storeadmins", isSuperAdmin, getAllStoreAdmins);
router.put("/deactivate/:id", isSuperAdmin, deactivateStoreAdmin);
router.put("/activate/:id", isSuperAdmin, activateStoreAdmin);
router.delete("/delete/:id", isSuperAdmin, deleteStoreAdmin);

router.get("/analytics", isSuperAdmin, getGlobalAnalytics);
router.get("/users", isSuperAdmin, getAllUsers);
router.get("/orders", isSuperAdmin, getAllOrders);
router.get("/products", isSuperAdmin, getAllProducts);

module.exports = router;
