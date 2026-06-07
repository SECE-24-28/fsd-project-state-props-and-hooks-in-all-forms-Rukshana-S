const express = require("express");
const router = express.Router();
const { createCoupon, getAllCoupons, applyCoupon, deleteCoupon } = require("../Controllers/CouponController");
const { verifyToken, isStoreAdmin } = require("../Utils/verifyToken");
const asyncHandler = require("../Middlewares/asyncHandler");
const { validate, couponRules } = require("../Middlewares/validationMiddleware");

router.post("/",       isStoreAdmin, validate(couponRules), asyncHandler(createCoupon));
router.get("/",        isStoreAdmin, asyncHandler(getAllCoupons));
router.delete("/:id",   isStoreAdmin, asyncHandler(deleteCoupon));
router.post("/apply",  verifyToken,  asyncHandler(applyCoupon));

module.exports = router;
