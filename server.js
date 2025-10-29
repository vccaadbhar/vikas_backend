const path = require("path");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import routes
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const feeRoutes = require("./routes/fees");
const classRoutes = require("./routes/classes");
const questionRoutes = require("./routes/questions");
const testRoutes = require("./routes/tests");
const parentRoutes = require("./routes/parents");
const reportRoutes = require("./routes/reports");
const notificationRoutes = require("./routes/notifications");
const materialRoutes = require("./routes/materials");
const dashboardRoutes = require("./routes/dashboard");
const expenseRoutes = require("./routes/expenses");
const quizRoutes = require("./routes/quizzes");
const teacherRoutes = require("./routes/teacher");

const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

/** ✅ CORS — allow dev & prod frontends */
const allowedOrigins = [
   "http://localhost:5173",   // Vite dev
  "http://localhost:3000",   // React dev
  "http://10.0.2.2:3000",    // Android emulator accessing local
  "http://10.0.2.2:4000",    // Android emulator backend direct
  "http://192.168.1.100:3000", // LAN IP (replace with your PC's IP)
  "http://192.168.1.100:4000",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  })
);

/** ✅ Body parsers */
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../vikas_frontend/dist")));

/** ✅ Routes */
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/admin", require("./routes/admin"));

/** ✅ Health check */
app.get("/health", (req, res) => res.json({ ok: true }));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../vikas_frontend/dist/index.html"));
});

/** ✅ Error handling (must be last) */
app.use(notFound);
app.use(errorHandler);

/** ✅ MongoDB connection */
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ Mongo error:", err);
    process.exit(1);
  });

/** ✅ Graceful shutdown */
process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await mongoose.connection.close();
  process.exit(0);
});

/** ✅ Start server */
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on ${PORT}`));

module.exports = app;
