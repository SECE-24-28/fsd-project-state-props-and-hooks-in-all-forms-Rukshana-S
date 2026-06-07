const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const errorMiddleware = require("./Middlewares/errorMiddleware");
require("dotenv").config();
const morgan = require("morgan");

// Validate critical environment variables
const criticalEnvVars = ["MONGO_URL", "JWT_SECRET"];
const missingVars = criticalEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`❌ CRITICAL ERROR: Missing required environment variables: ${missingVars.join(", ")}`);
  process.exit(1);
}

const app = express();

// Request logging middleware
app.use(morgan("dev"));

// Enable Trust Proxy for Render
app.set("trust proxy", 1);

// Gzip Compression
app.use(compression());

// Secure Headers
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." }
});
app.use("/api/", limiter);

app.use(express.json({ limit: "10mb" })); // support large base64 image payloads

console.log("FRONTEND_URL =", process.env.FRONTEND_URL);
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
  "https://wearly-frontend-htam.onrender.com"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.options("*", cors());

// Routes
const UserRoutes         = require("./Routes/UserRoutes");
const ProductRoutes      = require("./Routes/ProductRoutes");
const OrderRoutes        = require("./Routes/OrderRoutes");
const CartRoutes         = require("./Routes/CartRoutes");
const WishlistRoutes     = require("./Routes/WishlistRoutes");
const NotificationRoutes = require("./Routes/NotificationRoutes");
const StoreAdminRoutes   = require("./Routes/StoreAdminRoutes");
const SuperAdminRoutes   = require("./Routes/SuperAdminRoutes");
const PaymentRoutes      = require("./Routes/PaymentRoutes");
const ReviewRoutes       = require("./Routes/ReviewRoutes");
const CouponRoutes       = require("./Routes/CouponRoutes");

app.use("/api/users",         UserRoutes);
app.use("/api/products",      ProductRoutes);
app.use("/api/orders",        OrderRoutes);
app.use("/api/cart",          CartRoutes);
app.use("/api/wishlist",      WishlistRoutes);
app.use("/api/notifications", NotificationRoutes);
app.use("/api/storeadmin",    StoreAdminRoutes);
app.use("/api/superadmin",    SuperAdminRoutes);
app.use("/api/payment",       PaymentRoutes);
app.use("/api/reviews",       ReviewRoutes);
app.use("/api/coupons",       CouponRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime()
  });
});

app.get("/", (req, res) => res.json({ message: "WEARLY API running" }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// Centralized error handling middleware
app.use(errorMiddleware);

mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("MongoDB connected");
    
    // ── Migration 1: legacy images/colors → variants ──────────────────────────
    try {
      const Product = require("./Models/ProductModel");
      const oldProducts = await Product.find({
        $or: [{ variants: { $exists: false } }, { variants: { $size: 0 } }]
      });
      if (oldProducts.length > 0) {
        console.log(`[Migration] Found ${oldProducts.length} legacy products missing variants.`);
        for (const prod of oldProducts) {
          const rawDoc = await mongoose.connection.db.collection("products").findOne({ _id: prod._id });
          const oldImages = rawDoc.images || [];
          const oldColors = rawDoc.colors || [];
          const defaultColor = oldColors[0] || "Default";
          prod.variants = [{ color: defaultColor, images: oldImages }];
          prod.markModified("variants");
          await prod.save();
        }
        console.log("[Migration] Variants migration complete.");
      }
    } catch (migErr) {
      console.error("[Migration] Variants migration failed:", migErr.message);
    }

    // ── Migration 2: top-level spec fields → specifications sub-document ──────
    try {
      const Product = require("./Models/ProductModel");
      const specFields = ["fabric","pattern","occasion","sareeLength","blousePiece","careInstructions","material","fit","workType","countryOfOrigin"];
      // Find products that have any top-level spec field set but specifications is empty
      const specQuery = { $or: specFields.map(f => ({ [f]: { $exists: true, $ne: "" } })) };
      const legacySpecProducts = await mongoose.connection.db.collection("products")
        .find(specQuery).toArray();

      if (legacySpecProducts.length > 0) {
        console.log(`[Migration] Found ${legacySpecProducts.length} products with top-level spec fields to migrate.`);
        for (const rawDoc of legacySpecProducts) {
          const specs = {};
          for (const f of specFields) specs[f] = rawDoc[f] || "";
          // Unset top-level fields, set specifications sub-doc
          const unsetFields = {};
          for (const f of specFields) unsetFields[f] = "";
          await mongoose.connection.db.collection("products").updateOne(
            { _id: rawDoc._id },
            { $set: { specifications: specs }, $unset: unsetFields }
          );
        }
        console.log("[Migration] Specifications sub-document migration complete.");
      }
    } catch (migErr) {
      console.error("[Migration] Specifications migration failed:", migErr.message);
    }

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
