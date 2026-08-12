const express = require('express');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    fetchLatestBaileysVersion,
    getAggregateVotesInPollMessage
} = require('@whiskeysockets/baileys');
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

// Memory cache for active polls and pending inquiries
// Key: poll message id -> Value: { inquiry_id, pollKey, pollMessage, phone, remoteJid }
const activeSentPolls = new Map();
// Key: phone number (E.164 without +) -> Value: { inquiry_id, pollKey, pollMessage, phone, remoteJid }
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

/**
 * Process the consultant's decision (Aceptar / Rechazar), delete poll and notify Laravel
 */
async function processInquiryDecision(trackedData, action) {
    const { inquiry_id, pollKey, phone, remoteJid } = trackedData;
    const targetJid = remoteJid || `${phone}@s.whatsapp.net`;

    console.log(`⚡ [Poll Decision] Processing Inquiry #${inquiry_id} | Action: ${action === '1' ? 'Aceptar (1)' : 'Rechazar (2)'} | Phone: ${phone}`);

    // 1. Delete original poll message from chat so the user cannot click again
    if (pollKey && sock) {
        try {
            console.log(`🗑️ Deleting original poll message (${pollKey.id}) from chat...`);
            await sock.sendMessage(targetJid, { delete: pollKey });
        } catch (delError) {
            console.warn('⚠️ Could not delete poll message:', delError.message);
        }
    }

    // 2. Remove from memory tracking to prevent double voting
    if (pollKey && pollKey.id) {
        activeSentPolls.delete(pollKey.id);
    }
    pendingConsultantInquiries.delete(phone);

    // 3. Send Webhook notification to Laravel
    try {
        console.log(`📡 Sending webhook to Laravel: Inquiry #${inquiry_id}, response=${action}`);
        await axios.post(LARAVEL_WEBHOOK_URL, {
            phone: phone,
            inquiry_id: inquiry_id,
            response: action
        });
    } catch (error) {
        console.error('❌ Error sending webhook to Laravel:', error.message);
    }

    // 4. Send Confirmation feedback message to the consultant
    const confirmationText = action === '1'
        ? '✅ Has *aceptado* la consulta con éxito.\nEl estado ha sido actualizado a "En Contacto" en la plataforma.'
        : '❌ Has *rechazado* la consulta.\nLa consulta regresará a la bandeja principal para su reasignación.';

    if (sock) {
        try {
            await sock.sendMessage(targetJid, { text: confirmationText });
        } catch (msgError) {
            console.error('❌ Error sending confirmation message:', msgError.message);
        }
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
            browser: Browsers.ubuntu('Chrome'),
            getMessage: async (key) => {
                const tracked = activeSentPolls.get(key.id);
                if (tracked && tracked.pollMessage) {
                    return tracked.pollMessage;
                }
                return undefined;
            }
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

        // Event: Listen for Poll Votes (messages.update)
        sock.ev.on('messages.update', async (updates) => {
            for (const item of updates) {
                const { key, update } = item;
                if (!update || !update.pollUpdates) continue;

                const pollId = key.id;
                const trackedPoll = activeSentPolls.get(pollId);
                if (!trackedPoll) continue;

                console.log(`📊 Received poll update for Inquiry #${trackedPoll.inquiry_id}`);

                try {
                    const aggregateVotes = getAggregateVotesInPollMessage({
                        message: trackedPoll.pollMessage,
                        pollUpdates: update.pollUpdates,
                    });

                    for (const option of aggregateVotes) {
                        if (option.voters && option.voters.length > 0) {
                            console.log(`🗳️ Option selected: "${option.name}" by ${option.voters.join(', ')}`);

                            if (option.name.includes('Aceptar')) {
                                await processInquiryDecision(trackedPoll, '1');
                            } else if (option.name.includes('Rechazar')) {
                                await processInquiryDecision(trackedPoll, '2');
                            }
                            break;
                        }
                    }
                } catch (err) {
                    console.error('Error parsing poll update votes:', err);
                }
            }
        });

        // Event: Messages received (Fallback text replies & reactions)
        sock.ev.on('messages.upsert', async (m) => {
            if (m.type !== 'notify') return;

            const msg = m.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const rawSenderJid = msg.key.participant || msg.key.remoteJid;
            const senderPhone = rawSenderJid.split('@')[0];
            const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;
            const reaction = msg.message.reactionMessage?.text;

            const pendingData = pendingConsultantInquiries.get(senderPhone);
            if (!pendingData) return;

            let mappedAction = null;

            // 1. Check if consultant reacted
            if (reaction) {
                const cleanReaction = reaction.replace(/[\uFE0F]/g, '').trim();
                if (cleanReaction === '✅' || cleanReaction === '👍') mappedAction = '1';
                if (cleanReaction === '❌' || cleanReaction === '👎') mappedAction = '2';
            }
            // 2. Check if consultant replied with text
            else if (textMessage) {
                const cleanText = textMessage.trim().toLowerCase();
                if (['1', 'acepto', 'aceptar', 'si', 'sí', '✅', 'tomo'].includes(cleanText)) {
                    mappedAction = '1';
                } else if (['2', 'rechazo', 'rechazar', 'no', '❌', 'pasar'].includes(cleanText)) {
                    mappedAction = '2';
                }
            }

            if (mappedAction) {
                await processInquiryDecision(pendingData, mappedAction);
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

        // 1. Send the main inquiry information text
        await sock.sendMessage(formattedPhone, { text: message });
        console.log(`Sent inquiry details to ${formattedPhone}`);

        await new Promise(resolve => setTimeout(resolve, 600));

        // 2. Dispatch interactive Poll Message (Encuesta de opción única)
        const pollMsg = await sock.sendMessage(formattedPhone, {
            poll: {
                name: `📋 *Asignación de Consulta #${inquiry_id}*`,
                values: [
                    '✅ Aceptar Asignación',
                    '❌ Rechazar Asignación'
                ],
                selectableCount: 1
            }
        });

        console.log(`Dispatched poll message (${pollMsg.key.id}) for Inquiry #${inquiry_id}`);

        // Store poll reference for decryption, vote tracking, and auto-delete
        const pollData = {
            inquiry_id: inquiry_id,
            pollKey: pollMsg.key,
            pollMessage: pollMsg.message,
            phone: cleanPhone,
            remoteJid: formattedPhone
        };

        activeSentPolls.set(pollMsg.key.id, pollData);
        pendingConsultantInquiries.set(cleanPhone, pollData);

        res.json({ success: true, message: 'Inquiry details and interactive poll sent successfully' });
    } catch (error) {
        console.error('Error sending message and poll:', error);
        res.status(500).json({ success: false, error: 'Internal server error while sending message' });
    }
});

app.listen(PORT, () => {
    console.log(`WhatsApp Microservice running on port ${PORT}`);
});