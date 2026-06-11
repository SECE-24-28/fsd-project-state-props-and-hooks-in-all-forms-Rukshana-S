const Spin = require("../Models/SpinModel");
const Coupon = require("../Models/CouponModel");

// Helpers
const PRIZES = [
  "15_OFF",
  "FREE_SHIPPING",
  "NOT_LUCKY",
  "25_OFF",
  "FREE_SHIPPING",
  "NOT_LUCKY"
];

const generateCouponCode = (type) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomStr = "";
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  if (type === "15_OFF") return `WEARLY15-${randomStr}`;
  if (type === "25_OFF") return `WEARLY25-${randomStr}`;
  if (type === "FREE_SHIPPING") return `SHIPFREE-${randomStr}`;
  return null;
};

const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

exports.getSpinStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    
    const lastSpin = await Spin.findOne({ userId }).sort({ createdAt: -1 });
    
    if (!lastSpin) {
      return res.status(200).json({ canSpin: true });
    }
    
    if (now < lastSpin.nextSpinDate) {
      const daysLeft = Math.ceil((lastSpin.nextSpinDate - now) / (1000 * 60 * 60 * 24));
      return res.status(200).json({ canSpin: false, daysLeft });
    }
    
    return res.status(200).json({ canSpin: true });
  } catch (error) {
    console.error("Error in getSpinStatus:", error);
    res.status(500).json({ success: false, message: "Server error checking spin status" });
  }
};

exports.performSpin = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    
    // Double check status
    const lastSpin = await Spin.findOne({ userId }).sort({ createdAt: -1 });
    if (lastSpin && now < lastSpin.nextSpinDate) {
      return res.status(400).json({ success: false, message: "Already spun this week" });
    }
    
    // Choose random prize (1/6 chance)
    const randomIndex = Math.floor(Math.random() * PRIZES.length);
    const prize = PRIZES[randomIndex];
    
    let couponCode = null;
    if (prize !== "NOT_LUCKY") {
      couponCode = generateCouponCode(prize);
      
      const newCoupon = new Coupon({
        userId,
        code: couponCode,
        type: prize,
        used: false
      });
      await newCoupon.save();
    }
    
    const nextSpinDate = new Date(now);
    nextSpinDate.setDate(now.getDate() + 7);
    
    const newSpin = new Spin({
      userId,
      lastSpinDate: now,
      nextSpinDate,
      weekNumber: getWeekNumber(now)
    });
    await newSpin.save();
    
    return res.status(200).json({
      success: true,
      prize,
      coupon: couponCode,
      nextSpinDate
    });
    
  } catch (error) {
    console.error("Error in performSpin:", error);
    res.status(500).json({ success: false, message: "Server error performing spin" });
  }
};
