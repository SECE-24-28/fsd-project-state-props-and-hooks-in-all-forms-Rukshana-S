const express = require("express");
const router = express.Router();
const { sendContactMessage, getAllMessages, getUserMessages, replyMessage, customerReply } = require("../Controllers/ContactController");
const { verifyToken, isSuperAdmin } = require("../Utils/verifyToken");
const asyncHandler = require("../Middlewares/asyncHandler");

// Public (or user) route to create a message
// If token exists, we extract req.user in middleware, but we don't strictly require it to post.
// However, to use getUserMessages, they must be authenticated.
// Let's create an optional auth middleware or just use standard if they are logged in.
// We'll write a small middleware to optionally attach user.
const jwt = require("jsonwebtoken");
const attachOptionalUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch(e) {}
  }
  next();
};

router.post("/", attachOptionalUser, asyncHandler(sendContactMessage));
router.get("/admin", verifyToken, isSuperAdmin, asyncHandler(getAllMessages));
router.get("/my-messages", verifyToken, asyncHandler(getUserMessages));
router.put("/reply/:id", verifyToken, isSuperAdmin, asyncHandler(replyMessage));
router.put("/customer-reply/:id", verifyToken, asyncHandler(customerReply));

module.exports = router;
