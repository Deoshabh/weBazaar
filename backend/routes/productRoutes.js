const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductBySlug,
  getCategories,
  searchProducts,
} = require("../controllers/productController");

router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/categories", getCategories);
router.get("/:slug", getProductBySlug);

module.exports = router;
