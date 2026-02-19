const express = require("express");
const router = express.Router();
const { validateCoupon } = require("../controllers/adminCouponController");
const { authenticate } = require("../middleware/auth");

// @route   POST /api/v1/coupons/validate
// @desc    Validate coupon code
// @access  Private (requires auth)
router.post("/validate", authenticate, validateCoupon);

module.exports = router;
