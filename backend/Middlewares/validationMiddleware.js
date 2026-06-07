const { body, validationResult } = require("express-validator");

// Helper to run validation rules and check results
const validate = (rules) => {
  return [
    ...rules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }
  ];
};

// Validation rules definition
const loginRules = [
  body("email").isEmail().withMessage("Please enter a valid email address").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required")
];

const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please enter a valid email address").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("phone").optional({ checkFalsy: true }).trim().notEmpty().withMessage("Phone number cannot be empty if provided")
];

const profileRules = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("phone").optional().trim().notEmpty().withMessage("Phone number cannot be empty"),
  body("addresses").optional().isArray().withMessage("Addresses must be an array")
];

const productRules = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("price").isFloat({ min: 0.01 }).withMessage("Price must be a number greater than 0"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("variants").isArray({ min: 1 }).withMessage("At least one variant is required")
];

const orderRules = [
  body("products").isArray({ min: 1 }).withMessage("Products list is required and cannot be empty"),
  body("amount").isFloat({ min: 0 }).withMessage("Amount must be a non-negative number"),
  body("address").notEmpty().withMessage("Shipping address is required")
];

const couponRules = [
  body("code").trim().notEmpty().withMessage("Coupon code is required"),
  body("discount").isFloat({ min: 1, max: 10000 }).withMessage("Discount must be a number between 1 and 10000"),
  body("discountType").optional().isIn(["percentage", "fixed"]).withMessage("Discount type must be percentage or fixed")
];

const reviewRules = [
  body("productId").isMongoId().withMessage("Invalid product ID format"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be an integer between 1 and 5"),
  body("comment").trim().notEmpty().withMessage("Comment cannot be empty")
];

module.exports = {
  validate,
  loginRules,
  registerRules,
  profileRules,
  productRules,
  orderRules,
  couponRules,
  reviewRules
};
