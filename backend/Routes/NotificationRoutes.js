const express = require("express");
const router = express.Router();
const { createNotification, getNotifications, updateNotification, markAllRead, deleteNotification } = require("../Controllers/NotificationController");
const { verifyToken, isSuperAdmin } = require("../Utils/verifyToken");

router.post("/",          isSuperAdmin, createNotification);
router.get("/",           verifyToken,  getNotifications);
router.put("/mark-all",   verifyToken,  markAllRead);
router.put("/:id",        verifyToken,  updateNotification);
router.delete("/:id",     isSuperAdmin, deleteNotification);

module.exports = router;

