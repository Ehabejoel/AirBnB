const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Campay webhook endpoint
router.post('/campay', webhookController.campayWebhook);

module.exports = router;
