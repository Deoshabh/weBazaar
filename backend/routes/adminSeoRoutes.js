const express = require("express");
const router = express.Router();
const {
  getAllSeoSettings,
  getSeoByPageKey,
  upsertSeoSetting,
  deleteSeoSetting,
  resetToDefault,
  bulkCopy,
  getHistory,
  getDefaults,
} = require("../controllers/seoController");
const { authenticate } = require("../middleware/auth");
const admin = require("../middleware/admin");

// All routes require authentication and admin role
router.use(authenticate);
router.use(admin);

// @route   GET /api/v1/admin/seo
router.get("/", getAllSeoSettings);

// @route   GET /api/v1/admin/seo/defaults
router.get("/defaults", getDefaults);

// @route   GET /api/v1/admin/seo/:pageKey/history
router.get("/:pageKey/history", getHistory);

// @route   PUT /api/v1/admin/seo/:pageKey
router.put("/:pageKey", upsertSeoSetting);

// @route   POST /api/v1/admin/seo/:pageKey/reset
router.post("/:pageKey/reset", resetToDefault);

// @route   POST /api/v1/admin/seo/bulk-copy
router.post("/bulk-copy", bulkCopy);

// @route   DELETE /api/v1/admin/seo/:pageKey
router.delete("/:pageKey", deleteSeoSetting);

module.exports = router;
