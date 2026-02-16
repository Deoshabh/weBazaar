const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { verifyRecaptcha } = require('../middleware/recaptcha');
const { submitContactMessage } = require('../controllers/contactController');

const contactLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	message: { message: 'Too many contact requests, please try again later' },
	standardHeaders: true,
	legacyHeaders: false,
});

// @route   POST /api/v1/contact
router.post('/', contactLimiter, verifyRecaptcha('CONTACT_FORM', 0.5, true), submitContactMessage);

module.exports = router;
