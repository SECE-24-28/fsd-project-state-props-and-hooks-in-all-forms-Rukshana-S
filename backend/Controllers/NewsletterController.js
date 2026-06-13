const User = require("../Models/UserModel");

const subscribeNewsletter = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.isPremium) {
      return res.status(400).json({ success: false, message: "Already subscribed." });
    }

    user.isPremium = true;
    user.premiumSince = new Date();
    await user.save();

    res.status(200).json({ success: true, message: "Subscribed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

module.exports = { subscribeNewsletter };
