// ===============================
// Load environment variables FIRST
// ===============================
const dotenv = require("dotenv");
dotenv.config();

// ===============================
// Imports
// ===============================
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { initializeBucket } = require("./utils/minio");

// ===============================
// App init
// ===============================
const app = express();

// ===============================
// Trust Proxy (Traefik)
// ===============================
app.set("trust proxy", 1);

// ===============================
// Database Connection
// ===============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ===============================
// CORS (Production safe)
// ===============================
const allowedOrigins = ["https://radeo.in", "https://www.radeo.in"];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS not allowed"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ===============================
// Middleware
// ===============================
app.use(express.json());
app.use(cookieParser());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// ===============================
// Routes
// ===============================
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/products", require("./routes/productRoutes"));
app.use("/api/v1/cart", require("./routes/cartRoutes"));
app.use("/api/v1/orders", require("./routes/orderRoutes"));
app.use("/api/v1/filters", require("./routes/filterRoutes"));

app.use("/api/v1/admin/orders", require("./routes/adminOrderRoutes"));
app.use("/api/v1/admin/products", require("./routes/adminProductRoutes"));
app.use("/api/v1/admin/coupons", require("./routes/adminCouponRoutes"));
app.use("/api/v1/admin", require("./routes/adminStatsRoutes"));
app.use("/api/v1/admin/categories", require("./routes/adminCategoryRoutes"));
app.use("/api/v1/admin/users", require("./routes/adminUserRoutes"));
app.use("/api/v1/admin/media", require("./routes/adminMediaRoutes"));
app.use("/api/v1/admin/filters", require("./routes/adminFilterRoutes"));

app.use("/api/v1/coupons", require("./routes/couponRoutes"));
app.use("/api/v1/categories", require("./routes/categoryRoutes"));
app.use("/api/v1/addresses", require("./routes/addressRoutes"));
app.use("/api/v1/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/v1/user", require("./routes/userRoutes"));

// ===============================
// Health Check
// ===============================
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// ===============================
// Global Error Handler
// ===============================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// ===============================
// START SERVER (BLOCKING)
// ===============================
async function startServer() {
  try {
    // 🔴 CRITICAL: wait for MinIO
    await initializeBucket();
    console.log("✅ MinIO initialized — starting server");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log("📡 CORS allowed origins:", allowedOrigins.join(", "));
    });
  } catch (err) {
    console.error("❌ Fatal startup error:", err.message);
    process.exit(1);
  }
}

startServer();
