const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "..", "public", "_redirects");
const destination = path.join(__dirname, "..", "build", "_redirects");

try {
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, destination);
    console.log("✅ _redirects copied successfully");
  } else {
    console.warn("⚠ public/_redirects not found");
  }
} catch (err) {
  console.error("Failed to copy _redirects:", err);
}
