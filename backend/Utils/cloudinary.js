const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (base64Str) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Str, {
      upload_preset: undefined, // use default or configured preset
      resource_type: "auto",
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error("[Cloudinary] Upload failed:", error.message);
    throw new Error("Image upload failed: " + error.message);
  }
};

module.exports = { cloudinary, uploadImage };
