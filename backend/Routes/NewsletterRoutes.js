const express = require("express");
const router = express.Router();
const { subscribeNewsletter } = require("../Controllers/NewsletterController");
const { verifyToken } = require("../Utils/verifyToken");

router.post("/subscribe", verifyToken, subscribeNewsletter);

module.exports = router;
