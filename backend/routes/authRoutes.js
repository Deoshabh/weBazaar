const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validateRequest");
const { registerSchema, loginSchema } = require("../validators/schemas");

const {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword,
  firebaseLogin,
} = require("../controllers/authController");

// Public auth routes
router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/firebase-login", firebaseLogin);

// Protected auth routes
router.get("/me", authenticate, getCurrentUser);
router.post("/change-password", authenticate, changePassword);

module.exports = router;
