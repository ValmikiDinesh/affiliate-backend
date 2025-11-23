const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    imageUrl: String,
    affiliateUrl: { type: String, required: true },
    category: String,
    price: {
      type: Number,   // 👈 THIS is important
      required: false,
    },
    isActive: { type: Boolean, default: true },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
