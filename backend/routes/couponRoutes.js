const express = require("express");
const router = express.Router();
const { validateCoupon } = require("../controllers/adminCouponController");

// @route   POST /api/v1/coupons/validate
// @desc    Validate coupon code
// @access  Public
router.post("/validate", validateCoupon);

router.get("/test", (req, res) => {
  res.json({ message: "Coupon routes working" });
});

module.exports = router;
