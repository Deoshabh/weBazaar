const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate, authorize } = require('../middleware/auth');

// Public route
router.get('/public', settingsController.getPublicSettings);

// Admin routes
router.use(authenticate);
router.use(authorize('admin', 'designer', 'publisher'));

router.get('/', settingsController.getAllSettings);
router.put('/', settingsController.updateSettings);
router.get('/history', settingsController.getThemeVersionHistory);
router.post('/history/restore', settingsController.restoreThemeVersion);
router.post('/publish/run', settingsController.runPublishWorkflowNow);
router.post('/reset-defaults', settingsController.resetStorefrontDefaults);
router.get('/export', settingsController.exportThemeJson);
router.post('/import', settingsController.importThemeJson);

module.exports = router;
