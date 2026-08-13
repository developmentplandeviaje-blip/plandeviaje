const path = require('path');
const { sha256 } = require('@whiskeysockets/baileys');
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const LARAVEL_WEBHOOK_URL = process.env.LARAVEL_WEBHOOK_URL || 'http://localhost:8000/api/webhooks/whatsapp';
const AUTH_DIR = path.resolve(__dirname, '..', 'auth_info_baileys');

// Poll options and precomputed SHA-256 hashes
const ACCEPT_OPTION_TEXT = '✅ Aceptar Asignación';
const REJECT_OPTION_TEXT = '❌ Rechazar Asignación';
const ACCEPT_HASH = sha256(Buffer.from(ACCEPT_OPTION_TEXT)).toString('hex');
const REJECT_HASH = sha256(Buffer.from(REJECT_OPTION_TEXT)).toString('hex');

module.exports = {
    PORT,
    LARAVEL_WEBHOOK_URL,
    AUTH_DIR,
    ACCEPT_OPTION_TEXT,
    REJECT_OPTION_TEXT,
    ACCEPT_HASH,
    REJECT_HASH
};
