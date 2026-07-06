require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const cakeRoutes = require("./routes/cakes");
const galleryRoutes = require("./routes/gallery");
const categoryRoutes = require("./routes/categories");

// ── Connect to MongoDB Atlas ───────────────────────────────────────────────
connectDB();

const app = express();

// ── Security & logging middleware ──────────────────────────────────────────
app.use(helmet());
app.use(morgan("dev"));

// ── CORS — allow the frontend origin ──────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://crocehtandknots.vercel.app",
  "https://locrochet.vercel.app",
  "http://localhost:3000",
  "http://localhost:8080",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

// ── Body parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Health check ───────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "The Totacro API is running 🧶", timestamp: new Date() });
});

// ── Admin key verification ─────────────────────────────────────────────────
app.post("/api/admin/verify", express.json(), (req, res) => {
  const { key } = req.body ?? {};
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret) {
    return res.status(500).json({ success: false, message: "Admin key not configured on server" });
  }
  if (!key || key !== secret) {
    return res.status(401).json({ success: false, message: "Invalid admin key" });
  }
  res.json({ success: true });
});

// ── API routes ─────────────────────────────────────────────────────────────
app.use("/api/cakes", cakeRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/categories", categoryRoutes);

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Central error handler (must be last) ──────────────────────────────────
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🧶  The Totacro API running on http://localhost:${PORT}`);
  console.log(`📋  Admin endpoints:`);
  console.log(`    GET/POST        /api/cakes`);
  console.log(`    GET/PUT/DELETE  /api/cakes/:id`);
  console.log(`    GET/POST        /api/gallery`);
  console.log(`    GET/PUT/DELETE  /api/gallery/:id`);
  console.log(`    POST            /api/gallery/bulk-delete`);
  console.log(`    GET/POST        /api/categories`);
  console.log(`    GET/PUT/DELETE  /api/categories/:id\n`);
});
