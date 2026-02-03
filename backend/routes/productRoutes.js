const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductBySlug,
  getCategories,
  searchProducts,
  getBrands,
  getMaterials,
  getPriceRange,
  getColors,
  getSizes,
} = require("../controllers/productController");

router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/categories", getCategories);
router.get("/brands", getBrands);
router.get("/materials", getMaterials);
router.get("/price-range", getPriceRange);
router.get("/colors", getColors);
router.get("/sizes", getSizes);
router.get("/:slug", getProductBySlug);

module.exports = router;
