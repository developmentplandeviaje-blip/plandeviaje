const express = require('express');
const router = express.Router();
const {
    requestPairingCode,
    getStatus,
    sendInquiryAndPoll
} = require('../services/whatsapp.service');

// Status endpoint
router.get('/status', (req, res) => {
    res.json(getStatus());
});

// Pairing code endpoint
router.post('/pair', async (req, res) => {
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ success: false, error: 'Phone number is required for pairing.' });
    }

    try {
        const result = await requestPairingCode(phone);
        return res.json(result);
    } catch (err) {
        console.error('Error requesting pairing code:', err);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate pairing code',
            details: err.message
        });
    }
});

// Send message and poll endpoint
router.post('/send', async (req, res) => {
    const { phone, message, inquiry_id } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ success: false, error: 'Phone and message are required' });
    }

    try {
        const result = await sendInquiryAndPoll(phone, message, inquiry_id);
        res.json({ success: true, message: 'Inquiry details and interactive poll sent successfully', ...result });
    } catch (error) {
        const statusCode = error.message.includes('not connected') ? 503 : 500;
        res.status(statusCode).json({ success: false, error: error.message });
    }
});

module.exports = router;
