const Category = require("../models/Category");
const { log } = require("../utils/logger");

// @desc    Get active categories
// @route   GET /api/v1/categories
// @access  Public
exports.getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      displayOrder: 1,
      name: 1,
    });
    res.json({ categories });
  } catch (error) {
    log.error("Get categories error", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get navbar categories (only those marked to show in navbar)
// @route   GET /api/v1/categories/navbar
// @access  Public
exports.getNavbarCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      isActive: true,
      showInNavbar: true,
    }).sort({
      displayOrder: 1,
      name: 1,
    });
    res.json({ categories });
  } catch (error) {
    log.error("Get navbar categories error", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get category by slug
// @route   GET /api/v1/categories/:slug
// @access  Public
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ category });
  } catch (error) {
    log.error("Get category by slug error", error);
    res.status(500).json({ message: "Server error" });
  }
};
