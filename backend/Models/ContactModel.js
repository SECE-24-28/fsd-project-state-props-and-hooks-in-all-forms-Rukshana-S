const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema({
  sender: { type: String, enum: ["admin", "customer"], required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ContactSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, default: "Support Ticket" },
    message: { type: String, required: true },
    replies: [ReplySchema],
    status: {
      type: String,
      enum: ["Pending", "Replied"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", ContactSchema);
