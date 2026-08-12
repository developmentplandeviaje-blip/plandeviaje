const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const cors = require('cors');
const axios = require('axios');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const LARAVEL_WEBHOOK_URL = process.env.LARAVEL_WEBHOOK_URL || 'http://localhost:8000/api/webhooks/whatsapp';
const AUTH_DIR = path.resolve(__dirname, 'auth_info_baileys');

let sock = null;
let currentPairingCode = '';
let isConnected = false;
let isConnecting = false;

// Memory cache to map a WhatsApp message ID to a specific Laravel Inquiry database ID
// Memory cache to map WhatsApp messages and active consultant pending inquiries
// Key: msg.key.id (string) -> Value: { inquiry_id: 123 }
const activeSentMessages = new Map();
// Key: phone (string without +) -> Value: { inquiry_id: 123, message_id: '...' }
const pendingConsultantInquiries = new Map();

/**
 * Clean up local authentication directory and reset in-memory state
 */
function cleanAuthSession() {
    try {
        if (fs.existsSync(AUTH_DIR)) {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
            console.log('🧹 [Auth] Credenciales residuales/corruptas eliminadas correctamente.');
        }
    } catch (err) {
        console.error('❌ [Auth] Error eliminando carpeta de autenticación:', err.message);
    }
}

async function startWhatsAppConnection() {
    if (isConnected || isConnecting) return sock;
    isConnecting = true;

    try {
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`Using WhatsApp v${version.join('.')}, isLatest: ${isLatest}`);

        sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }), // Suppress internal logs
            browser: Browsers.ubuntu('Chrome')
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'close') {
                isConnected = false;
                isConnecting = false;
                currentPairingCode = '';

                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;
                const shouldReconnect = !isLoggedOut && statusCode !== 405;

                console.log(`Connection closed. Reason: ${statusCode} (isLoggedOut: ${isLoggedOut})`);

                if (isLoggedOut) {
                    console.warn('⚠️ [Baileys] Sesión invalidada / cerrada por el servidor (401 LoggedOut). Purgando credenciales...');
                    cleanAuthSession();
                    sock = null;
                } else if (shouldReconnect) {
                    console.log('Reconnecting automatically...');
                    setTimeout(startWhatsAppConnection, 5000);
                } else {
                    console.log('Session rejected. Waiting for manual reconnection or pairing request.');
                    sock = null;
                }
            } else if (connection === 'open') {
                isConnected = true;
                isConnecting = false;
                currentPairingCode = '';
                console.log('✅ Opened connection to WhatsApp');
            }
        });

        // Event: Save Credentials
        sock.ev.on('creds.update', saveCreds);

        // Event: Messages received
        sock.ev.on('messages.upsert', async (m) => {
            if (m.type !== 'notify') return;

            const msg = m.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            // For reactions or group messages, the actual sender's ID is often in `participant`
            const rawSenderJid = msg.key.participant || msg.key.remoteJid;
            const senderPhone = rawSenderJid.split('@')[0];
            const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;
            const reaction = msg.message.reactionMessage?.text;

            let trimmedReaction = null;
            if (reaction) {
                // Remove invisible hidden characters sometimes added by mobile OS emojis
                trimmedReaction = reaction.replace(/[\uFE0F]/g, '').trim();
            }

            let mappedResponse = null;
            let inquiryId = null;
            let targetKeyToRemove = null;

            // 1. Process reaction from advisor (without requiring pre-reactions)
            if (trimmedReaction) {
                console.log(`Received reaction from ${senderPhone}: ${trimmedReaction}`);
                const reactedMessageId = msg.message.reactionMessage?.key?.id;
                const tracked = activeSentMessages.get(reactedMessageId);
                const pendingByPhone = pendingConsultantInquiries.get(senderPhone);

                if (trimmedReaction === '✅' || trimmedReaction === '👍') {
                    mappedResponse = '1';
                } else if (trimmedReaction === '❌' || trimmedReaction === '👎') {
                    mappedResponse = '2';
                }

                if (tracked) {
                    inquiryId = tracked.inquiry_id;
                    targetKeyToRemove = reactedMessageId;
                } else if (pendingByPhone) {
                    inquiryId = pendingByPhone.inquiry_id;
                    targetKeyToRemove = pendingByPhone.message_id;
                }
            }
            // 2. Process text reply from advisor (e.g., "1", "2", "acepto", "rechazo", "✅", "❌")
            else if (textMessage) {
                const cleanText = textMessage.trim().toLowerCase();
                console.log(`Received text message from ${senderPhone}: ${cleanText}`);
                const pendingByPhone = pendingConsultantInquiries.get(senderPhone);

                if (['1', 'acepto', 'aceptar', 'si', 'sí', '✅', 'tomo'].includes(cleanText)) {
                    mappedResponse = '1';
                } else if (['2', 'rechazo', 'rechazar', 'no', '❌', 'pasar'].includes(cleanText)) {
                    mappedResponse = '2';
                }

                if (pendingByPhone && mappedResponse) {
                    inquiryId = pendingByPhone.inquiry_id;
                    targetKeyToRemove = pendingByPhone.message_id;
                }
            }

            if (mappedResponse && inquiryId) {
                try {
                    console.log(`Sending webhook to Laravel for Inquiry ID ${inquiryId} with answer ${mappedResponse} (from ${senderPhone})`);
                    await axios.post(LARAVEL_WEBHOOK_URL, {
                        phone: senderPhone,
                        inquiry_id: inquiryId,
                        response: mappedResponse
                    });

                    await sock.sendMessage(msg.key.remoteJid, {
                        text: mappedResponse === '1'
                            ? '✅ Has *aceptado* la consulta con éxito.\nEl estado ha sido actualizado a "En Contacto" en la plataforma.'
                            : '❌ Has *rechazado* la consulta.\nLa consulta regresará a la bandeja principal para su reasignación.'
                    });

                    if (targetKeyToRemove) {
                        activeSentMessages.delete(targetKeyToRemove);
                    }
                    pendingConsultantInquiries.delete(senderPhone);
                } catch (error) {
                    console.error('Error sending webhook to Laravel:', error.message);
                }
            }
        });

        return sock;
    } catch (error) {
        console.error("Error starting WhatsApp connection:", error);
        isConnecting = false;
        return null;
    }
}

// Check initial session on boot without forcing a new code loop
async function checkInitialSession() {
    const credsPath = path.join(AUTH_DIR, 'creds.json');
    if (fs.existsSync(credsPath)) {
        console.log('Found existing credentials. Attempting to restore session...');
        startWhatsAppConnection();
    } else {
        console.log('No existing session found. Waiting for frontend to request a pairing code via /pair endpoint.');
    }
}

checkInitialSession();

// --- Express Endpoints ---

// Pairing code endpoint
app.post('/pair', async (req, res) => {
    const { phone, forceReset = false } = req.body;

    if (isConnected) {
        return res.json({ connected: true, code: null });
    }

    if (!phone) {
        return res.status(400).json({ success: false, error: 'Phone number is required for pairing.' });
    }

    // Format phone: must be E.164 without '+'
    const formattedPhone = phone.replace(/[^0-9]/g, '');

    try {
        // If not connected, clean any corrupt/invalid legacy auth files to start a fresh pairing session
        if (!isConnected) {
            if (sock) {
                try {
                    sock.end(new Error('Resetting socket for fresh pairing'));
                } catch (e) {
                    // Ignore socket termination errors
                }
                sock = null;
            }
            isConnecting = false;
            cleanAuthSession();
        }

        console.log('Booting fresh Baileys instance for pairing...');
        await startWhatsAppConnection();

        // Wait briefly for Baileys socket to register listener handlers
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (!sock) {
            throw new Error('Socket failed to initialize.');
        }

        console.log(`Requesting pairing code for: ${formattedPhone}`);
        const code = await sock.requestPairingCode(formattedPhone);
        currentPairingCode = code;
        return res.json({ connected: false, code: currentPairingCode });
    } catch (err) {
        console.error('Error requesting pairing code:', err);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate pairing code',
            details: err.message
        });
    }
});

app.get('/status', (req, res) => {
    res.json({ connected: isConnected, code: currentPairingCode });
});

app.post('/send', async (req, res) => {
    const { phone, message, inquiry_id } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ success: false, error: 'Phone and message are required' });
    }

    if (!isConnected || !sock) {
        return res.status(503).json({ success: false, error: 'WhatsApp is not connected yet.' });
    }

    try {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const formattedPhone = `${cleanPhone}@s.whatsapp.net`;

        // 1. Send inquiry details
        await sock.sendMessage(formattedPhone, { text: message });
        console.log(`Sent inquiry details to ${formattedPhone}`);

        await new Promise(resolve => setTimeout(resolve, 600));

        // 2. Send options message clearly without placing any pre-reactions
        const promptMsg = await sock.sendMessage(formattedPhone, {
            text: "📌 *ASIGNACIÓN DE CONSULTA*\n\n" +
                  "Por favor responde a este mensaje para gestionar la asignación:\n\n" +
                  "• Envía *1* (o reacciona con ✅) para *ACEPTAR*\n" +
                  "• Envía *2* (o reacciona con ❌) para *RECHAZAR*"
        });

        // Store mapping for both reaction tracking and direct text reply
        activeSentMessages.set(promptMsg.key.id, { inquiry_id: inquiry_id });
        pendingConsultantInquiries.set(cleanPhone, { inquiry_id: inquiry_id, message_id: promptMsg.key.id });

        res.json({ success: true, message: 'Message sequence sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, error: 'Internal server error while sending message' });
    }
});

app.listen(PORT, () => {
    console.log(`WhatsApp Microservice running on port ${PORT}`);
});
