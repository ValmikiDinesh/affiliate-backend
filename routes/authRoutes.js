// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Called from server.js after DB connect
async function ensureAdmin() {
  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!existing) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await User.create({
      email: process.env.ADMIN_EMAIL,
      password: hash,
      role: "admin",
    });
    console.log("Admin user created:", process.env.ADMIN_EMAIL);
  }
}
module.exports.ensureAdmin = ensureAdmin;

// DEBUG: add this line to confirm route is loaded
console.log("authRoutes loaded");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  console.log("Login route hit"); // <--- DEBUG LOG

  try {
    const { email, password } = req.body;
    console.log("Body:", req.body); // <--- DEBUG LOG

    const admin = await User.findOne({ email });
    if (!admin) {
      console.log("No user found");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, email: admin.email });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports.router = router;
