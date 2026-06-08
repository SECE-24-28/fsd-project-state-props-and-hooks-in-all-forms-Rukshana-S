const fs = require("fs");
const path = require("path");

const buildPath = path.join(__dirname, "..", "build");
const filesToCheck = [
  path.join(buildPath, "index.html"),
  path.join(buildPath, "_redirects")
];

const dirsToCheck = [
  path.join(buildPath, "static", "js"),
  path.join(buildPath, "static", "css")
];

let failed = false;

console.log("🔍 Running deployment validation checks...");

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ File exists: ${path.relative(path.join(__dirname, ".."), file)}`);
  } else {
    console.error(`❌ Missing file: ${path.relative(path.join(__dirname, ".."), file)}`);
    failed = true;
  }
});

dirsToCheck.forEach(dir => {
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    console.log(`✅ Directory exists: ${path.relative(path.join(__dirname, ".."), dir)}`);
  } else {
    console.error(`❌ Missing directory: ${path.relative(path.join(__dirname, ".."), dir)}`);
    failed = true;
  }
});

if (failed) {
  console.error("❌ Deployment validation failed!");
  process.exit(1);
} else {
  console.log("🎉 All deployment validation checks passed!");
  process.exit(0);
}
