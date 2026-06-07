const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true },
    email:        { type: String, required: true, unique: true, lowercase: true },
    password:     { type: String, required: true },
    phone:        { type: String, default: "" },
    role:         { type: String, enum: ["user", "store-admin", "super-admin"], default: "user" },
    status:       { type: String, enum: ["pending", "approved", "rejected", "deactivated"], default: "approved" },
    storeName:    { type: String, default: "" },
    brandName:        { type: String, default: "" },
    brandLogo:        { type: String, default: "" },
    brandDescription: { type: String, default: "" },
    profileImage:     { type: String, default: "" },
    addresses: [
      {
        name:        { type: String },
        fullName:    { type: String },
        phone:       { type: String },
        street:      { type: String },
        addressLine: { type: String },
        city:        { type: String },
        state:       { type: String },
        pincode:     { type: String },
        isDefault: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
