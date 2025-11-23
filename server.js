// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");
const { router: authRoutes, ensureAdmin } = require("./routes/authRoutes");

const app = express();

// --------- CORS (DEV: allow all) ---------
app.use(cors()); // ✅ This fixes 99% of CORS issues for localhost

// --------- Body parsing ---------
app.use(express.json());

// --------- Health check ---------
app.get("/", (req, res) => {
  res.send("API is running");
});

// --------- Routes ---------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// (Optional) 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// --------- Start server after DB connect ---------
const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await ensureAdmin(); // create admin from .env if not exists
    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Mongo error:", err);
    process.exit(1);
  });
