const express = require("express");
const router = express.Router();
const { createCoupon, getAllCoupons, applyCoupon, deleteCoupon } = require("../Controllers/CouponController");
const { verifyToken, isStoreAdmin } = require("../Utils/verifyToken");

router.post("/",       isStoreAdmin, createCoupon);
router.get("/",        isStoreAdmin, getAllCoupons);
router.delete("/:id",   isStoreAdmin, deleteCoupon);
router.post("/apply",  verifyToken,  applyCoupon);

module.exports = router;
