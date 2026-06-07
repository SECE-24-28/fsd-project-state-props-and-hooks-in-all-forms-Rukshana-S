const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true },
    message:      { type: String, required: true },
    // Role-based broadcast: who sees it (all / user / store-admin / super-admin)
    role:         { type: String, enum: ["user", "store-admin", "super-admin", "all"], default: "all" },
    // Optional: target a specific user instead of role broadcast
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    // Notification type for icon mapping on frontend
    type:         { type: String, enum: ["order", "stock", "approved", "rejected", "review", "system"], default: "system" },
    read:         { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Static helper to fire-and-forget a notification (catches its own errors)
NotificationSchema.statics.fire = async function(data) {
  try {
    await this.create(data);
  } catch (e) {
    console.error("[Notification.fire] Failed:", e.message);
  }
};

module.exports = mongoose.model("Notification", NotificationSchema);

