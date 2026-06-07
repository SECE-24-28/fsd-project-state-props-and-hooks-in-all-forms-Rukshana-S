const Product = require("../Models/ProductModel");
const User    = require("../Models/UserModel");
const { uploadImage } = require("../Utils/cloudinary");

// Helper: build specifications object from flat request body or nested object
function buildSpecs(body) {
  // If body already sends a nested specifications object, use it
  const src = body.specifications || body;
  return {
    fabric:           src.fabric           || "",
    pattern:          src.pattern          || "",
    occasion:         src.occasion         || "",
    sareeLength:      src.sareeLength      || "",
    blousePiece:      src.blousePiece      || "",
    careInstructions: src.careInstructions || "",
    material:         src.material         || "",
    fit:              src.fit              || "",
    workType:         src.workType         || "",
    countryOfOrigin:  src.countryOfOrigin  || "",
  };
}

// Helper: upload variant images (base64 → Cloudinary URL)
async function processVariants(variants) {
  const uploaded = [];
  for (const variant of variants) {
    const imagesArray = [];
    for (const imgObj of (variant.images || [])) {
      if (!imgObj || (!imgObj.url && typeof imgObj === "string")) {
        let urlStr = typeof imgObj === "string" ? imgObj : "";
        if (urlStr.startsWith("data:image/")) {
          urlStr = await uploadImage(urlStr);
        }
        if (urlStr.startsWith("http://")) {
          urlStr = urlStr.replace("http://", "https://");
        }
        imagesArray.push({ name: "Front View", url: urlStr });
        continue;
      }
      let finalUrl = imgObj.url || "";
      if (finalUrl && finalUrl.startsWith("data:image/")) {
        finalUrl = await uploadImage(finalUrl);
      }
      if (finalUrl && finalUrl.startsWith("http://")) {
        finalUrl = finalUrl.replace("http://", "https://");
      }
      imagesArray.push({ name: imgObj.name || "Image", url: finalUrl });
    }
    uploaded.push({ color: variant.color || "Default", images: imagesArray });
  }
  return uploaded;
}

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, description, brand, category, price, stock, variants, sizes, status } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: "name and price are required" });
    }

    let uploadedVariants = [];
    if (variants && variants.length) {
      try {
        uploadedVariants = await processVariants(variants);
      } catch (error) {
        console.error("[ProductController] Cloudinary upload failed:", error);
        return res.status(500).json({ success: false, message: "Image upload failed", error: error.message });
      }
    }

    const seller = await User.findById(req.user.id);
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    const product = await Product.create({
      name,
      description: description || "",
      brand: seller.brandName || seller.storeName || brand || "",
      category: category || "",
      price: Number(price),
      stock: Number(stock) || 0,
      variants: uploadedVariants,
      sizes: sizes || [],
      status: status || "active",
      sellerId:   seller._id,
      sellerName: seller.storeName || seller.name || "",
      brandName:  seller.brandName || seller.storeName || "",
      specifications: buildSpecs(req.body),
    });

    res.status(201).json({ success: true, message: "Product created", data: product });
  } catch (err) {
    console.error("[ProductController] createProduct error:", err);
    res.status(500).json({ success: false, message: err.message || "Error creating product", error: err.message });
  }
};

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const { name, category, brand, minPrice, maxPrice, status, sellerId, search, sort } = req.query;
    const filter = {};
    if (name)     filter.name     = { $regex: name, $options: "i" };
    if (category && category !== "All") filter.category = { $regex: category, $options: "i" };
    if (brand)    filter.brand    = { $regex: brand, $options: "i" };
    if (status)   filter.status   = status;
    if (sellerId) filter.sellerId = sellerId;

    if (search) {
      filter.$or = [
        { name:       { $regex: search, $options: "i" } },
        { brand:      { $regex: search, $options: "i" } },
        { category:   { $regex: search, $options: "i" } },
        { sellerName: { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc" || sort === "low")  sortOption = { price: 1 };
    else if (sort === "price_desc" || sort === "high") sortOption = { price: -1 };
    else if (sort === "popularity") sortOption = { numOfReviews: -1 };
    else if (sort === "rating")     sortOption = { ratings: -1 };

    const products = await Product.find(filter)
      .populate("sellerId", "name storeName brandName")
      .sort(sortOption);

    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (err) {
    console.error("[ProductController] getProducts:", err.message);
    res.status(500).json({ success: false, message: "Error fetching products", error: err.message });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    const product = await Product.findById(req.params.id)
      .populate("sellerId", "name storeName brandName").lean();
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    // Fallback values to prevent crashes on frontend
    product.variants = product.variants || [];
    product.specifications = product.specifications || {};
    product.sizes = product.sizes || [];

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    console.error("[ProductController] getProductById:", err.message);
    res.status(500).json({ success: false, message: "Error fetching product", error: err.message });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    if (req.user.role !== "super-admin" && product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Process variant images
    if (req.body.variants && req.body.variants.length) {
      try {
        req.body.variants = await processVariants(req.body.variants);
      } catch (error) {
        console.error("[ProductController] Cloudinary upload failed in update:", error);
        return res.status(500).json({ success: false, message: "Image upload failed", error: error.message });
      }
    }

    // Merge specifications from flat or nested body
    req.body.specifications = buildSpecs(req.body);

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).lean();
    if (updated) {
      updated.variants = updated.variants || [];
      updated.specifications = updated.specifications || {};
      updated.sizes = updated.sizes || [];
    }
    res.status(200).json({ success: true, message: "Product updated", data: updated });
  } catch (err) {
    console.error("[ProductController] updateProduct:", err.message);
    res.status(500).json({ success: false, message: "Error updating product", error: err.message });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    if (req.user.role !== "super-admin" && product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("[ProductController] deleteProduct:", err.message);
    res.status(500).json({ success: false, message: "Error deleting product", error: err.message });
  }
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
