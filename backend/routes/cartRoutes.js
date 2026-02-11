const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

const { authenticate } = require("../middleware/auth");

// All cart routes require authentication
router.get("/", authenticate, getCart);
router.post("/", authenticate, addToCart);
router.delete("/", authenticate, clearCart);
router.delete("/:productId/:size", authenticate, removeFromCart);
router.put("/items", authenticate, require("../controllers/cartController").updateCartItemQuantity);

module.exports = router;
