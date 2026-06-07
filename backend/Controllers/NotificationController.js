const Notification = require("../Models/NotificationModel");

// POST /api/notifications
const createNotification = async (req, res) => {
  try {
    const { title, message, role, type, targetUserId } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: "title and message are required" });
    }
    const notification = await Notification.create({
      title,
      message,
      role:         role         || "all",
      type:         type         || "system",
      targetUserId: targetUserId || null,
    });
    res.status(201).json({ success: true, message: "Notification created", data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating notification", error: err.message });
  }
};

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    let filter;
    if (req.user.role === "super-admin") {
      // Super admin sees everything
      filter = {};
    } else {
      // Each user sees role-broadcasts + their own targeted notifications
      filter = {
        $or: [
          { role: req.user.role },
          { role: "all" },
          { targetUserId: req.user.id },
        ],
      };
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching notifications", error: err.message });
  }
};

// PUT /api/notifications/:id  — mark as read
const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    res.status(200).json({ success: true, message: "Marked as read", data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating notification", error: err.message });
  }
};

// PUT /api/notifications/mark-all — mark all as read for this user
const markAllRead = async (req, res) => {
  try {
    const filter = req.user.role === "super-admin"
      ? {}
      : { $or: [{ role: req.user.role }, { role: "all" }, { targetUserId: req.user.id }] };
    await Notification.updateMany({ ...filter, read: false }, { $set: { read: true } });
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error marking all read", error: err.message });
  }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting notification", error: err.message });
  }
};

module.exports = { createNotification, getNotifications, updateNotification, markAllRead, deleteNotification };

