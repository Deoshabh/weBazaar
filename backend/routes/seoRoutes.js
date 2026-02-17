const express = require("express");
const router = express.Router();
const { getSeoByPageKey } = require("../controllers/seoController");

// @route   GET /api/v1/seo/:pageKey
// Public route - no auth required
router.get("/:pageKey", getSeoByPageKey);

module.exports = router;
