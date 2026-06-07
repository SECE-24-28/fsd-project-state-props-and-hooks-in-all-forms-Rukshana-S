const express = require("express");
const router = express.Router();
const { createNotification, getNotifications, updateNotification, markAllRead, deleteNotification } = require("../Controllers/NotificationController");
const { verifyToken, isSuperAdmin } = require("../Utils/verifyToken");
const asyncHandler = require("../Middlewares/asyncHandler");

router.post("/",          isSuperAdmin, asyncHandler(createNotification));
router.get("/",           verifyToken,  asyncHandler(getNotifications));
router.put("/mark-all",   verifyToken,  asyncHandler(markAllRead));
router.put("/:id",        verifyToken,  asyncHandler(updateNotification));
router.delete("/:id",     isSuperAdmin, asyncHandler(deleteNotification));

module.exports = router;
