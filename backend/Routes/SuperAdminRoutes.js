const express = require("express");
const router = express.Router();
const {
  getApplications, approveStoreAdmin, rejectStoreAdmin,
  getAllStoreAdmins, deactivateStoreAdmin, activateStoreAdmin, deleteStoreAdmin,
  getGlobalAnalytics, getAllUsers, getAllOrders, getAllProducts,
} = require("../Controllers/SuperAdminController");
const { isSuperAdmin } = require("../Utils/verifyToken");
const asyncHandler = require("../Middlewares/asyncHandler");

router.get("/applications", isSuperAdmin, asyncHandler(getApplications));
router.put("/approve/:id", isSuperAdmin, asyncHandler(approveStoreAdmin));
router.put("/reject/:id", isSuperAdmin, asyncHandler(rejectStoreAdmin));

router.get("/storeadmins", isSuperAdmin, asyncHandler(getAllStoreAdmins));
router.put("/deactivate/:id", isSuperAdmin, asyncHandler(deactivateStoreAdmin));
router.put("/activate/:id", isSuperAdmin, asyncHandler(activateStoreAdmin));
router.delete("/delete/:id", isSuperAdmin, asyncHandler(deleteStoreAdmin));

router.get("/analytics", isSuperAdmin, asyncHandler(getGlobalAnalytics));
router.get("/users", isSuperAdmin, asyncHandler(getAllUsers));
router.get("/orders", isSuperAdmin, asyncHandler(getAllOrders));
router.get("/products", isSuperAdmin, asyncHandler(getAllProducts));

module.exports = router;
