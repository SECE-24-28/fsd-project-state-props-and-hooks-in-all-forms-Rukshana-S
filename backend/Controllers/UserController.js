const bcrypt = require("bcryptjs");
const User = require("../Models/UserModel");
const generateToken = require("../Utils/generateToken");
const Notification = require("../Models/NotificationModel");

// POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, storeName, brandName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRole = role === "store-admin" ? "store-admin" : "user";
    const userStatus = userRole === "store-admin" ? "pending" : "approved";

    if (userRole === "store-admin" && (!storeName || !brandName)) {
      return res.status(400).json({ success: false, message: "storeName and brandName required for store admin" });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || "",
      role: userRole,
      status: userStatus,
      storeName: storeName || "",
      brandName: brandName || "",
    });

    if (userRole === "store-admin") {
      Notification.fire({
        title: "New Seller Request 🏪",
        message: `A new seller application has been received from "${name}" (${storeName}).`,
        role: "super-admin",
        type: "system",
      });
    } else {
      Notification.fire({
        title: "New Customer Registered 🛍️",
        message: `A new customer "${name}" has registered on the platform.`,
        role: "super-admin",
        type: "system",
      });
    }

    const token = generateToken({ id: user._id, role: user.role, status: user.status });

    const sendEmail = require("../Utils/sendEmail");
    sendEmail({
      to: user.email,
      subject: userRole === "store-admin" ? "WEARLY - Store Application Received" : "Welcome to WEARLY!",
      text: userRole === "store-admin"
        ? `Hello ${user.name},\n\nWe have received your application to become a Store Admin at WEARLY. Your application is currently under review by our super admin team. We will notify you once a decision is made.\n\nBest regards,\nThe WEARLY Team`
        : `Hello ${user.name},\n\nWelcome to WEARLY! Your account has been registered successfully. Start shopping now!\n\nBest regards,\nThe WEARLY Team`,
    }).catch(err => console.error("Welcome email failed:", err.message));

    res.status(201).json({
      success: true,
      message: userRole === "store-admin" ? "Application submitted. Awaiting approval." : "Registration successful",
      data: { _id: user._id, name: user.name, email: user.email, role: user.role, status: user.status },
      token,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Registration failed", error: err.message });
  }
};

// POST /api/users/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.status === "pending") {
      return res.status(403).json({ success: false, message: "Account pending approval" });
    }
    if (user.status === "rejected") {
      return res.status(403).json({ success: false, message: "Account application rejected" });
    }
    if (user.status === "deactivated") {
      return res.status(403).json({ success: false, message: "Account has been deactivated" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken({ id: user._id, role: user.role, status: user.status });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { _id: user._id, name: user.name, email: user.email, role: user.role, status: user.status },
      token,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Login failed", error: err.message });
  }
};

// GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Prevent undefined values to avoid frontend crash
    user.addresses = user.addresses || [];
    user.profileImage = user.profileImage || "";
    user.brandLogo = user.brandLogo || "";
    user.brandDescription = user.brandDescription || "";
    user.phone = user.phone || "";
    user.storeName = user.storeName || "";
    user.brandName = user.brandName || "";

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching profile", error: err.message });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const updates = {};
    const allowed = ["name", "phone", "profileImage", "storeName", "brandName", "brandLogo", "brandDescription"];
    allowed.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    if (req.body.password) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    if (req.body.addresses) {
      updates.addresses = req.body.addresses.map(addr => ({
        fullName:    addr.fullName || addr.name || "",
        name:        addr.fullName || addr.name || "",
        phone:       addr.phone || "",
        pincode:     addr.pincode || "",
        addressLine: addr.addressLine || addr.street || "",
        street:      addr.addressLine || addr.street || "",
        city:        addr.city || "",
        state:       addr.state || "",
        isDefault:   addr.isDefault !== undefined ? addr.isDefault : false
      }));
    }

    // If base64 brandLogo is provided, we can upload it to Cloudinary
    if (req.body.brandLogo && req.body.brandLogo.startsWith("data:image/")) {
      const { uploadImage } = require("../Utils/cloudinary");
      try {
        const logoUrl = await uploadImage(req.body.brandLogo);
        updates.brandLogo = logoUrl;
      } catch (uploadErr) {
        console.error("Brand Logo upload failed:", uploadErr);
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password").lean();
    if (user) {
      user.addresses = user.addresses || [];
      user.profileImage = user.profileImage || "";
      user.brandLogo = user.brandLogo || "";
      user.brandDescription = user.brandDescription || "";
      user.phone = user.phone || "";
      user.storeName = user.storeName || "";
      user.brandName = user.brandName || "";
    }
    res.status(200).json({ success: true, message: "Profile updated", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed", error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "Reset link generated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error in forgot password request", error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Password reset failed", error: err.message });
  }
};

const getApprovedBrands = async (req, res) => {
  try {
    const brands = await User.find(
      { role: "store-admin", status: "approved" },
      "brandName storeName brandLogo brandDescription"
    );
    res.status(200).json({ success: true, data: brands });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching brands", error: err.message });
  }
};

module.exports = { registerUser, loginUser, getProfile, updateProfile, forgotPassword, resetPassword, getApprovedBrands };
