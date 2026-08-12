const express = require('express');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    fetchLatestBaileysVersion,
    decryptPollVote,
    getAggregateVotesInPollMessage,
    jidNormalizedUser,
    getKeyAuthor,
    sha256
} = require('@whiskeysockets/baileys');
const crypto = require('crypto');
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

// Precomputed SHA256 hashes of the poll option titles for instant matching
const ACCEPT_OPTION_TEXT = '✅ Aceptar Asignación';
const REJECT_OPTION_TEXT = '❌ Rechazar Asignación';
const ACCEPT_HASH = sha256(Buffer.from(ACCEPT_OPTION_TEXT)).toString('hex');
const REJECT_HASH = sha256(Buffer.from(REJECT_OPTION_TEXT)).toString('hex');

// Memory cache for active polls and pending inquiries
// Key: poll message id -> Value: { inquiry_id, pollKey, pollMessage, messageSecret, phone, remoteJid }
const activeSentPolls = new Map();
// Key: phone number (E.164 without +) -> Value: { inquiry_id, pollKey, pollMessage, messageSecret, phone, remoteJid }
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
            await sock.sendMessage(targetJid, {
                delete: {
                    remoteJid: targetJid,
                    id: pollKey.id,
                    fromMe: true
                }
            });
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

/**
 * Attempt to decrypt a poll vote by trying combinations of creator & voter JIDs (phone, LID, normalized)
 */
function tryDecryptPollVote(vote, { pollEncKey, pollMsgId, creationKey, msgKey, meId, meLid, fallbackPhone }) {
    const meIdNormalised = jidNormalizedUser(meId || '');
    const meLidNormalised = jidNormalizedUser(meLid || '');

    const creatorCandidates = [
        meLidNormalised,
        meLid,
        sock?.user?.lid,
        jidNormalizedUser(sock?.user?.lid || ''),
        sock?.authState?.creds?.me?.lid,
        jidNormalizedUser(sock?.authState?.creds?.me?.lid || ''),
        getKeyAuthor(creationKey, meIdNormalised),
        meIdNormalised,
        meId,
        sock?.user?.id,
        jidNormalizedUser(sock?.user?.id || ''),
        sock?.authState?.creds?.me?.id,
        jidNormalizedUser(sock?.authState?.creds?.me?.id || ''),
        creationKey?.remoteJid,
        creationKey?.participant
    ].filter(Boolean);

    const voterCandidates = [
        getKeyAuthor(msgKey, meIdNormalised),
        msgKey?.participant,
        msgKey?.remoteJid,
        msgKey?.participantAlt,
        msgKey?.remoteJidAlt,
        fallbackPhone ? `${fallbackPhone}@lid` : null,
        fallbackPhone ? `${fallbackPhone}@s.whatsapp.net` : null,
        jidNormalizedUser(msgKey?.participant || ''),
        jidNormalizedUser(msgKey?.remoteJid || '')
    ].filter(Boolean);

    for (const pollCreatorJid of [...new Set(creatorCandidates)]) {
        for (const voterJid of [...new Set(voterCandidates)]) {
            try {
                const decrypted = decryptPollVote(vote, {
                    pollEncKey,
                    pollCreatorJid,
                    pollMsgId,
                    voterJid
                });
                if (decrypted && decrypted.selectedOptions) {
                    console.log(`✅ [Decrypted Poll Vote] Success with creator="${pollCreatorJid}", voter="${voterJid}"`);
                    return decrypted;
                }
            } catch (e) {
                // Continue trying other combinations
            }
        }
    }
    throw new Error('Unable to authenticate data: none of the creator/voter JID combinations matched.');
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

        // Event: Listen for Poll Updates in messages.update (if emitted by library)
        sock.ev.on('messages.update', async (updates) => {
            for (const item of updates) {
                const { key, update } = item;
                if (!update || !update.pollUpdates) continue;

                const pollId = key.id;
                const trackedPoll = activeSentPolls.get(pollId);
                if (!trackedPoll) continue;

                console.log(`📊 [messages.update] Received poll update for Inquiry #${trackedPoll.inquiry_id}`);

                try {
                    const aggregateVotes = getAggregateVotesInPollMessage({
                        message: trackedPoll.pollMessage,
                        pollUpdates: update.pollUpdates,
                    });

                    for (const option of aggregateVotes) {
                        if (option.voters && option.voters.length > 0) {
                            console.log(`🗳️ Option selected: "${option.name}"`);
                            if (option.name.includes('Aceptar')) {
                                await processInquiryDecision(trackedPoll, '1');
                            } else if (option.name.includes('Rechazar')) {
                                await processInquiryDecision(trackedPoll, '2');
                            }
                            break;
                        }
                    }
                } catch (err) {
                    console.error('Error parsing poll update votes in messages.update:', err);
                }
            }
        });

        // Event: Messages received (Captures pollUpdateMessage, fallback text replies & reactions)
        sock.ev.on('messages.upsert', async (m) => {
            if (m.type !== 'notify') return;

            for (const msg of m.messages) {
                if (!msg.message || msg.key.fromMe) continue;

                const rawSenderJid = msg.key.participant || msg.key.remoteJid;
                const senderPhone = rawSenderJid.split('@')[0];

                // 1. Check if incoming message is a Poll Vote (pollUpdateMessage)
                const pollUpdate = msg.message.pollUpdateMessage;
                if (pollUpdate) {
                    const creationKey = pollUpdate.pollCreationMessageKey;
                    const pollMsgId = creationKey?.id;
                    console.log(`📊 [messages.upsert] Poll vote received for Poll ID: ${pollMsgId} from sender: ${rawSenderJid}`);

                    const trackedPoll = activeSentPolls.get(pollMsgId) || pendingConsultantInquiries.get(senderPhone);
                    if (trackedPoll && pollUpdate.vote) {
                        try {
                            const meId = sock.user?.id || sock.authState?.creds?.me?.id || '';
                            const meLid = sock.user?.lid || sock.authState?.creds?.me?.lid || '';
                            const pollEncKey = trackedPoll.messageSecret || trackedPoll.pollMessage?.messageContextInfo?.messageSecret;

                            if (pollEncKey) {
                                const decryptedVote = tryDecryptPollVote(pollUpdate.vote, {
                                    pollEncKey,
                                    pollMsgId: creationKey?.id || pollMsgId,
                                    creationKey,
                                    msgKey: msg.key,
                                    meId,
                                    meLid,
                                    fallbackPhone: trackedPoll.phone
                                });

                                const selectedOptions = decryptedVote.selectedOptions || [];
                                const selectedHexHashes = selectedOptions.map(opt => Buffer.from(opt).toString('hex'));
                                console.log(`🗳️ [Decrypted Vote] Selected option hashes:`, selectedHexHashes);

                                if (selectedHexHashes.includes(ACCEPT_HASH)) {
                                    console.log('✅ Option [Aceptar] matched by hash');
                                    await processInquiryDecision(trackedPoll, '1');
                                    continue;
                                } else if (selectedHexHashes.includes(REJECT_HASH)) {
                                    console.log('❌ Option [Rechazar] matched by hash');
                                    await processInquiryDecision(trackedPoll, '2');
                                    continue;
                                }
                            }
                        } catch (decryptError) {
                            console.error('❌ Error decrypting poll vote in messages.upsert:', decryptError.message);
                        }
                    }
                }

                // 2. Fallback: Check if consultant reacted or sent text message
                const pendingData = pendingConsultantInquiries.get(senderPhone);
                if (!pendingData) continue;

                const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;
                const reaction = msg.message.reactionMessage?.text;

                let mappedAction = null;

                if (reaction) {
                    const cleanReaction = reaction.replace(/[\uFE0F]/g, '').trim();
                    if (cleanReaction === '✅' || cleanReaction === '👍') mappedAction = '1';
                    if (cleanReaction === '❌' || cleanReaction === '👎') mappedAction = '2';
                } else if (textMessage) {
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

        // Generate explicit 32-byte secret for poll vote encryption
        const messageSecret = crypto.randomBytes(32);

        // 2. Dispatch interactive Poll Message (Encuesta de opción única)
        const pollMsg = await sock.sendMessage(formattedPhone, {
            poll: {
                name: `📋 *Asignación de Consulta #${inquiry_id}*`,
                values: [
                    ACCEPT_OPTION_TEXT,
                    REJECT_OPTION_TEXT
                ],
                selectableCount: 1,
                messageSecret: messageSecret
            }
        });

        console.log(`Dispatched poll message (${pollMsg.key.id}) for Inquiry #${inquiry_id}`);

        // Store poll reference for decryption, vote tracking, and auto-delete
        const pollData = {
            inquiry_id: inquiry_id,
            pollKey: pollMsg.key,
            pollMessage: pollMsg.message,
            messageSecret: messageSecret,
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