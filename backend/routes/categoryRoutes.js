const express = require("express");
const router = express.Router();
const {
  getActiveCategories,
  getNavbarCategories,
  getCategoryBySlug,
} = require("../controllers/categoryController");

// @route   GET /api/v1/categories
router.get("/", getActiveCategories);

// @route   GET /api/v1/categories/navbar
router.get("/navbar", getNavbarCategories);

// @route   GET /api/v1/categories/:slug
router.get("/:slug", getCategoryBySlug);

module.exports = router;
