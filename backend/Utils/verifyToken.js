const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

const isSuperAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== "super-admin") {
      return res.status(403).json({ success: false, message: "Super admin access required" });
    }
    next();
  });
};

const isStoreAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== "store-admin" && req.user.role !== "super-admin") {
      return res.status(403).json({ success: false, message: "Store admin access required" });
    }
    next();
  });
};

const isUser = (req, res, next) => {
  verifyToken(req, res, () => {
    next();
  });
};

module.exports = { verifyToken, isSuperAdmin, isStoreAdmin, isUser };
