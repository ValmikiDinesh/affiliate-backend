const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/auth");

// Public – list active products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});
// GET /api/products/admin  (admin – all products, active + inactive)
router.get("/admin", auth, async (req, res) => {
  try {
    // If you want to restrict to only admin users:
    // if (req.user.role !== "admin") {
    //   return res.status(403).json({ message: "Forbidden" });
    // }

    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Get all products (admin) error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin – create product
// POST /api/products
router.post("/", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      affiliateUrl,
      category,
      isActive,
      price,
    } = req.body;

    const product = await Product.create({
      title,
      description,
      imageUrl,
      affiliateUrl,
      category,
      isActive,
      // ensure price is saved as a Number if provided
      ...(price !== undefined && price !== null && price !== ""
        ? { price: Number(price) }
        : {}),
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Admin – update
router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin – delete
router.delete("/:id", auth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// Public – redirect to affiliate
router.get("/:id/redirect", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) return res.status(404).send("Not found");

    product.clicks += 1;
    await product.save();

    return res.redirect(product.affiliateUrl);
  } catch {
    res.status(500).send("Server error");
  }
});

module.exports = router;
