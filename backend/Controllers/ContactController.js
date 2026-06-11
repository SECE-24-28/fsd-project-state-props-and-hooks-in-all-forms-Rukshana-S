const Contact = require("../Models/ContactModel");
const Notification = require("../Models/NotificationModel");

// POST /api/contact
const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Name, email, and message are required" });
    }

    const newContact = {
      name,
      email,
      subject: subject || "Support Ticket",
      message,
      userId: req.user ? req.user.id : null,
      status: "Pending"
    };

    const contact = await Contact.create(newContact);
    
    // Notify admins
    Notification.fire({
      title: "New Support Ticket",
      message: `A new ticket from ${name}`,
      role: "super-admin",
      type: "system"
    });

    res.status(201).json({ success: true, message: "Message sent successfully", data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to send message", error: err.message });
  }
};

// GET /api/contact/admin
const getAllMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch messages", error: err.message });
  }
};

// GET /api/contact/my-messages
const getUserMessages = async (req, res) => {
  try {
    const messages = await Contact.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch user messages", error: err.message });
  }
};

// PUT /api/contact/reply/:id
const replyMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage) {
      return res.status(400).json({ success: false, message: "Reply message is required" });
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    contact.replies.push({
      sender: "admin",
      message: replyMessage,
      createdAt: new Date()
    });
    
    contact.status = "Replied";
    await contact.save();

    // Notify customer
    if (contact.userId) {
      Notification.fire({
        title: "Support Ticket Reply",
        message: `Admin replied to your ticket: ${contact.subject}`,
        targetUserId: contact.userId,
        type: "system"
      });
    }

    res.status(200).json({ success: true, message: "Reply sent successfully", data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to send reply", error: err.message });
  }
};

// PUT /api/contact/customer-reply/:id
const customerReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }

    const contact = await Contact.findOne({ _id: id, userId: req.user.id });
    if (!contact) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    contact.replies.push({
      sender: "customer",
      message: text,
      createdAt: new Date()
    });
    
    contact.status = "Pending"; // Changes back to pending for admin attention
    await contact.save();

    // Notify super admin
    Notification.fire({
      title: "Customer Replied",
      message: `${contact.name} replied to their ticket`,
      role: "super-admin",
      type: "system"
    });

    res.status(200).json({ success: true, message: "Reply sent successfully", data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to send reply", error: err.message });
  }
};

module.exports = {
  sendContactMessage,
  getAllMessages,
  getUserMessages,
  replyMessage,
  customerReply
};
