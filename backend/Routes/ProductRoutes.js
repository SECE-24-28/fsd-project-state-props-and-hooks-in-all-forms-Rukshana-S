const express = require("express");
const router = express.Router();
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } = require("../Controllers/ProductController");
const { verifyToken, isStoreAdmin } = require("../Utils/verifyToken");

router.post("/", isStoreAdmin, createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", isStoreAdmin, updateProduct);
router.delete("/:id", isStoreAdmin, deleteProduct);

module.exports = router;
