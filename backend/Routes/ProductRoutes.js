const express = require("express");
const router = express.Router();
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } = require("../Controllers/ProductController");
const { verifyToken, isStoreAdmin } = require("../Utils/verifyToken");
const asyncHandler = require("../Middlewares/asyncHandler");
const { validate, productRules } = require("../Middlewares/validationMiddleware");

router.post("/", isStoreAdmin, validate(productRules), asyncHandler(createProduct));
router.get("/", asyncHandler(getProducts));
router.get("/:id", asyncHandler(getProductById));
router.put("/:id", isStoreAdmin, asyncHandler(updateProduct));
router.delete("/:id", isStoreAdmin, asyncHandler(deleteProduct));

module.exports = router;
