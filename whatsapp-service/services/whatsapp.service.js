const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    fetchLatestBaileysVersion,
    getAggregateVotesInPollMessage
} = require('@whiskeysockets/baileys');
const crypto = require('crypto');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const {
    AUTH_DIR,
    ACCEPT_OPTION_TEXT,
    REJECT_OPTION_TEXT,
    ACCEPT_HASH,
    REJECT_HASH
} = require('../config');
const {
    activeSentPolls,
    pendingConsultantInquiries,
    registerSentPoll,
    getTrackedPoll,
    tryDecryptPollVote,
    processInquiryDecision
} = require('./poll.service');

let sock = null;
let currentPairingCode = '';
let isConnected = false;
let isConnecting = false;

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
 * Initialize and start the Baileys socket connection
 */
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
            logger: pino({ level: 'silent' }),
            browser: Browsers.ubuntu('Chrome'),
            getMessage: async (key) => {
                const tracked = activeSentPolls.get(key.id);
                return tracked ? tracked.pollMessage : undefined;
            }
        });

        // Handle connection lifecycle
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
                    console.warn('⚠️ [Baileys] Sesión invalidada (401 LoggedOut). Purgando credenciales...');
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

        // Save credentials updates
        sock.ev.on('creds.update', saveCreds);

        // Listen for library-emitted poll updates
        sock.ev.on('messages.update', async (updates) => {
            for (const item of updates) {
                const { key, update } = item;
                if (!update || !update.pollUpdates) continue;

                const trackedPoll = activeSentPolls.get(key.id);
                if (!trackedPoll) continue;

                try {
                    const aggregateVotes = getAggregateVotesInPollMessage({
                        message: trackedPoll.pollMessage,
                        pollUpdates: update.pollUpdates,
                    });

                    for (const option of aggregateVotes) {
                        if (option.voters && option.voters.length > 0) {
                            if (option.name.includes('Aceptar')) {
                                await processInquiryDecision(sock, trackedPoll, '1');
                            } else if (option.name.includes('Rechazar')) {
                                await processInquiryDecision(sock, trackedPoll, '2');
                            }
                            break;
                        }
                    }
                } catch (err) {
                    console.error('Error parsing poll updates in messages.update:', err);
                }
            }
        });

        // Listen for incoming messages, poll votes & fallback text/reactions
        sock.ev.on('messages.upsert', async (m) => {
            if (m.type !== 'notify') return;

            for (const msg of m.messages) {
                if (!msg.message || msg.key.fromMe) continue;

                const rawSenderJid = msg.key.participant || msg.key.remoteJid;
                const senderPhone = rawSenderJid.split('@')[0];

                // 1. Process Poll Vote (pollUpdateMessage)
                const pollUpdate = msg.message.pollUpdateMessage;
                if (pollUpdate) {
                    const creationKey = pollUpdate.pollCreationMessageKey;
                    const pollMsgId = creationKey?.id;
                    console.log(`📊 [messages.upsert] Poll vote received for Poll ID: ${pollMsgId} from sender: ${rawSenderJid}`);

                    const trackedPoll = getTrackedPoll(pollMsgId, senderPhone);
                    if (trackedPoll && pollUpdate.vote) {
                        try {
                            const pollEncKey = trackedPoll.messageSecret || trackedPoll.pollMessage?.messageContextInfo?.messageSecret;
                            if (pollEncKey) {
                                const decryptedVote = tryDecryptPollVote(pollUpdate.vote, {
                                    pollEncKey,
                                    pollMsgId: creationKey?.id || pollMsgId,
                                    creationKey,
                                    msgKey: msg.key,
                                    sock,
                                    fallbackPhone: trackedPoll.phone
                                });

                                const selectedOptions = decryptedVote.selectedOptions || [];
                                const selectedHexHashes = selectedOptions.map(opt => Buffer.from(opt).toString('hex'));

                                if (selectedHexHashes.includes(ACCEPT_HASH)) {
                                    console.log('✅ Option [Aceptar] matched by hash');
                                    await processInquiryDecision(sock, trackedPoll, '1');
                                    continue;
                                } else if (selectedHexHashes.includes(REJECT_HASH)) {
                                    console.log('❌ Option [Rechazar] matched by hash');
                                    await processInquiryDecision(sock, trackedPoll, '2');
                                    continue;
                                }
                            }
                        } catch (decryptError) {
                            console.error('❌ Error decrypting poll vote in messages.upsert:', decryptError.message);
                        }
                    }
                }

                // 2. Fallback: text response or emoji reaction
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
                    await processInquiryDecision(sock, pendingData, mappedAction);
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

/**
 * Check if existing session credentials exist on startup
 */
async function checkInitialSession() {
    const credsPath = path.join(AUTH_DIR, 'creds.json');
    if (fs.existsSync(credsPath)) {
        console.log('Found existing credentials. Attempting to restore session...');
        await startWhatsAppConnection();
    } else {
        console.log('No existing session found. Waiting for pairing code request.');
    }
}

/**
 * Generate a pairing code for the specified phone number
 */
async function requestPairingCode(phone) {
    if (isConnected) {
        return { connected: true, code: null };
    }

    const formattedPhone = phone.replace(/[^0-9]/g, '');

    if (!isConnected) {
        if (sock) {
            try {
                sock.end(new Error('Resetting socket for fresh pairing'));
            } catch (e) {}
            sock = null;
        }
        isConnecting = false;
        cleanAuthSession();
    }

    console.log('Booting fresh Baileys instance for pairing...');
    await startWhatsAppConnection();
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (!sock) {
        throw new Error('Socket failed to initialize.');
    }

    console.log(`Requesting pairing code for: ${formattedPhone}`);
    currentPairingCode = await sock.requestPairingCode(formattedPhone);
    return { connected: false, code: currentPairingCode };
}

/**
 * Send inquiry detail message and interactive poll
 */
async function sendInquiryAndPoll(phone, message, inquiryId) {
    if (!isConnected || !sock) {
        throw new Error('WhatsApp is not connected yet.');
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formattedPhone = `${cleanPhone}@s.whatsapp.net`;

    // 1. Send description message
    const descMsg = await sock.sendMessage(formattedPhone, { text: message });
    console.log(`Sent inquiry details to ${formattedPhone}`);

    await new Promise(resolve => setTimeout(resolve, 600));

    // 2. Dispatch interactive poll
    const messageSecret = crypto.randomBytes(32);
    const pollMsg = await sock.sendMessage(formattedPhone, {
        poll: {
            name: `📋 *Asignación de Consulta #${inquiryId}*`,
            values: [ACCEPT_OPTION_TEXT, REJECT_OPTION_TEXT],
            selectableCount: 1,
            messageSecret: messageSecret
        }
    });

    console.log(`Dispatched poll message (${pollMsg.key.id}) for Inquiry #${inquiryId}`);

    // Register poll data in memory cache
    const pollData = {
        inquiry_id: inquiryId,
        pollKey: pollMsg.key,
        descKey: descMsg?.key,
        pollMessage: pollMsg.message,
        messageSecret: messageSecret,
        phone: cleanPhone,
        remoteJid: formattedPhone
    };

    registerSentPoll(pollMsg.key.id, cleanPhone, pollData);
    return { success: true, pollId: pollMsg.key.id };
}

function getStatus() {
    return { connected: isConnected, code: currentPairingCode };
}

module.exports = {
    startWhatsAppConnection,
    checkInitialSession,
    requestPairingCode,
    sendInquiryAndPoll,
    getStatus,
    cleanAuthSession
};
