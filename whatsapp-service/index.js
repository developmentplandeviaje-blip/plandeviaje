const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const cors = require('cors');
const axios = require('axios');
const pino = require('pino');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const LARAVEL_WEBHOOK_URL = process.env.LARAVEL_WEBHOOK_URL || 'http://localhost:8000/api/webhooks/whatsapp';

let sock = null;
let currentPairingCode = '';
let isConnected = false;
let isConnecting = false;

// Memory cache to map a WhatsApp message ID to a specific Laravel Inquiry database ID
// Key: msg.key.id (string) -> Value: { inquiry_id: 123, action: '1' }
const activeSentMessages = new Map();

async function startWhatsAppConnection() {
    if (isConnected || isConnecting) return;
    isConnecting = true;

    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`Using WhatsApp v${version.join('.')}, isLatest: ${isLatest}`);

        sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }), // Suppress baileys internal logs
            browser: Browsers.ubuntu('Chrome')
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'close') {
                isConnected = false;
                isConnecting = false;
                currentPairingCode = '';

                const statusCode = lastDisconnect.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut && statusCode !== 405;

                console.log('Connection closed. Reason:', statusCode);

                if (shouldReconnect) {
                    console.log('Reconnecting automatically...');
                    setTimeout(startWhatsAppConnection, 5000);
                } else {
                    console.log('Session invalidated or rejected. Waiting for manual reconnection request.');
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

            if (textMessage) {
                const trimmedMessage = textMessage.trim();
                console.log(`Received text message from ${senderPhone}: ${trimmedMessage}`);
            } else if (trimmedReaction) {
                console.log(`Received reaction from ${senderPhone}: ${trimmedReaction}`);

                const reactedMessageId = msg.message.reactionMessage?.key?.id;
                const mappedAction = activeSentMessages.get(reactedMessageId);

                let mappedResponse = null;
                let inquiryId = null;

                if (mappedAction) {
                    mappedResponse = mappedAction.action;
                    inquiryId = mappedAction.inquiry_id;

                    // Verify the reaction matches the expected button just in case
                    if (mappedResponse === '1' && trimmedReaction !== '✅') return;
                    if (mappedResponse === '2' && trimmedReaction !== '❌') return;
                }

                if (mappedResponse && inquiryId) {
                    try {
                        console.log(`Sending webhook to Laravel for Inquiry ID ${inquiryId} with answer ${mappedResponse} (from reaction)`);
                        await axios.post(LARAVEL_WEBHOOK_URL, {
                            phone: senderPhone,
                            inquiry_id: inquiryId,
                            response: mappedResponse
                        });

                        await sock.sendMessage(msg.key.remoteJid, {
                            text: mappedResponse === '1'
                                ? '✅ Has aceptado la consulta.\nEl estado ha sido actualizado en la plataforma.'
                                : '❌ Has rechazado la consulta.\nLa consulta regresará a la bandeja principal.'
                        });

                        // Delete keys from memory to avoid double-processing
                        // We could clean up the other option too if we stored their sibling relationships, but keeping it simple.
                        activeSentMessages.delete(reactedMessageId);

                    } catch (error) {
                        console.error('Error sending webhook to Laravel from reaction:', error.message);
                    }
                } else {
                    console.log('Reaction ignored. Target message ID not tracked in memory.');
                }
            }
        });

    } catch (error) {
        console.error("Error starting WhatsApp connection:", error);
        isConnecting = false;
    }
}

// Check initial session on boot without forcing a new code loop
async function checkInitialSession() {
    const fs = require('fs');
    if (fs.existsSync('./auth_info_baileys/creds.json')) {
        console.log('Found existing credentials. Attempting to restore session...');
        startWhatsAppConnection();
    } else {
        console.log('No existing session found. Waiting for frontend to request a pairing code via /pair endpoint.');
    }
}

checkInitialSession();

// --- Express Endpoints ---

// Pairing code endpoint (Replaces /qr)
app.post('/pair', async (req, res) => {
    const { phone } = req.body;

    if (isConnected) {
        return res.json({ connected: true, code: null });
    }

    if (!phone) {
        return res.status(400).json({ success: false, error: 'Phone number is required for pairing.' });
    }

    // Format phone: must be E.164 without '+'
    const formattedPhone = phone.replace(/[^0-9]/g, '');

    if (!sock) {
        console.log('Frontend requested pairing code. Booting Baileys...');
        await startWhatsAppConnection();
        // Wait briefly for sock to initialize
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    try {
        console.log(`Requesting pairing code for: ${formattedPhone}`);
        // requestPairingCode automatically binds to the connecting session
        const code = await sock.requestPairingCode(formattedPhone);
        currentPairingCode = code;
        return res.json({ connected: false, code: currentPairingCode });
    } catch (err) {
        console.error('Error requesting pairing code:', err);
        return res.status(500).json({ success: false, error: 'Failed to generate pairing code' });
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
        const formattedPhone = `${phone.replace(/[^0-9]/g, '')}@s.whatsapp.net`;

        // 1. Send the main inquiry information
        await sock.sendMessage(formattedPhone, { text: message });
        console.log(`Sent inquiry details to ${formattedPhone}`);

        await new Promise(resolve => setTimeout(resolve, 500));

        // 2. Send Accept option and react to it
        const acceptMsg = await sock.sendMessage(formattedPhone, { text: "Reacciona a este mensaje con ✅ para tomar la consulta" });
        await sock.sendMessage(formattedPhone, { react: { text: "✅", key: acceptMsg.key } });
        activeSentMessages.set(acceptMsg.key.id, { inquiry_id: inquiry_id, action: '1' });

        await new Promise(resolve => setTimeout(resolve, 500));

        // 3. Send Reject option and react to it
        const rejectMsg = await sock.sendMessage(formattedPhone, { text: "Reacciona a este mensaje con ❌ para asignar la consulta a otro asesor" });
        await sock.sendMessage(formattedPhone, { react: { text: "❌", key: rejectMsg.key } });
        activeSentMessages.set(rejectMsg.key.id, { inquiry_id: inquiry_id, action: '2' });

        res.json({ success: true, message: 'Message sequence sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, error: 'Internal server error while sending message' });
    }
});

app.listen(PORT, () => {
    console.log(`WhatsApp Microservice running on port ${PORT}`);
});
