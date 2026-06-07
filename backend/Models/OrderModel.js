const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name:      { type: String },
        price:     { type: Number },
        quantity:  { type: Number, default: 1 },
        image:     { type: String },
        size:      { type: String, default: "" },
        color:     { type: String, default: "" },
        // Seller info stored at order time — survives product deletion
        sellerId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        storeName: { type: String, default: "" },
        brand:     { type: String, default: "" },
      },
    ],
    amount:        { type: Number, required: true },
    address: {
      name:    { type: String },
      phone:   { type: String },
      street:  { type: String },
      city:    { type: String },
      state:   { type: String },
      pincode: { type: String },
    },
    paymentMethod: { type: String, enum: ["card", "upi", "cod", "online"], default: "cod" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    orderStatus:   { type: String, enum: ["Pending", "Confirmed", "Processing", "Packed", "Shipped", "On The Way", "Out For Delivery", "Delivered", "Cancelled", "Returned"], default: "Pending" },
    statusHistory: {
      type: [
        {
          status:    { type: String },
          updatedAt: { type: Date, default: Date.now }
        }
      ],
      default: () => [{ status: "Pending", updatedAt: new Date() }]
    },
    // Who cancelled: "customer" | "admin" | ""
    cancelledBy:  { type: String, enum: ["customer", "admin", ""], default: "" },
    sellerName:   { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);

