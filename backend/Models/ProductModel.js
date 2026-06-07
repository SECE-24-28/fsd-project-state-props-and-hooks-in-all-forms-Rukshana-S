const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true },
    description:  { type: String, default: "" },
    brand:        { type: String, default: "" },
    category:     { type: String, default: "" },
    price:        { type: Number, required: true, min: 0 },
    stock:        { type: Number, default: 0, min: 0 },

    // Color variants — each with its own image array
    variants: [
      {
        color:  { type: String, required: true },
        images: [
          {
            name: { type: String, default: "" },
            url:  { type: String, required: true }
          }
        ]
      }
    ],

    // Structured specification fields (Myntra / Ajio style)
    specifications: {
      fabric:           { type: String, default: "" },
      pattern:          { type: String, default: "" },
      occasion:         { type: String, default: "" },
      sareeLength:      { type: String, default: "" },
      blousePiece:      { type: String, default: "" },
      careInstructions: { type: String, default: "" },
      material:         { type: String, default: "" },
      fit:              { type: String, default: "" },
      workType:         { type: String, default: "" },
      countryOfOrigin:  { type: String, default: "" },
    },

    sizes:        { type: [String], default: [] },
    sellerId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sellerName:   { type: String, default: "" },
    brandName:    { type: String, default: "" },
    status:       { type: String, enum: ["active", "inactive"], default: "active" },
    ratings:      { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search
ProductSchema.index({ name: "text", brand: "text", category: "text", description: "text" });

module.exports = mongoose.model("Product", ProductSchema);
