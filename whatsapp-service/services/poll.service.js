const axios = require('axios');
const {
    decryptPollVote,
    jidNormalizedUser,
    getKeyAuthor
} = require('@whiskeysockets/baileys');
const {
    LARAVEL_WEBHOOK_URL,
    ACCEPT_HASH,
    REJECT_HASH
} = require('../config');

// Memory caches
// Key: poll message id -> Value: { inquiry_id, pollKey, pollMessage, messageSecret, phone, remoteJid }
const activeSentPolls = new Map();
// Key: phone number (E.164 without +) -> Value: { inquiry_id, pollKey, pollMessage, messageSecret, phone, remoteJid }
const pendingConsultantInquiries = new Map();

/**
 * Register a sent poll in memory
 */
function registerSentPoll(pollMsgId, phone, pollData) {
    activeSentPolls.set(pollMsgId, pollData);
    pendingConsultantInquiries.set(phone, pollData);
}

/**
 * Get tracked poll by message ID or phone
 */
function getTrackedPoll(pollMsgId, phone) {
    return (pollMsgId && activeSentPolls.get(pollMsgId)) || (phone && pendingConsultantInquiries.get(phone));
}

/**
 * Attempt to decrypt a poll vote by testing combinations of creator & voter JIDs (Phone, LID, normalized)
 */
function tryDecryptPollVote(vote, { pollEncKey, pollMsgId, creationKey, msgKey, sock, fallbackPhone }) {
    const meId = sock?.user?.id || sock?.authState?.creds?.me?.id || '';
    const meLid = sock?.user?.lid || sock?.authState?.creds?.me?.lid || '';
    const meIdNormalised = jidNormalizedUser(meId);
    const meLidNormalised = jidNormalizedUser(meLid);

    const creatorCandidates = [
        meLidNormalised,
        meLid,
        sock?.user?.lid,
        sock?.authState?.creds?.me?.lid,
        getKeyAuthor(creationKey, meIdNormalised),
        meIdNormalised,
        meId,
        sock?.user?.id,
        sock?.authState?.creds?.me?.id,
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
                // Try next pair
            }
        }
    }
    throw new Error('Unable to authenticate data: none of the creator/voter JID combinations matched.');
}

/**
 * Process the consultant's decision (Aceptar / Rechazar), delete poll and notify Laravel
 */
async function processInquiryDecision(sock, trackedData, action) {
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

    // 1.2. If rejected, also delete the description/details message
    if (action === '2' && trackedData.descKey && sock) {
        try {
            console.log(`🗑️ Deleting details description message (${trackedData.descKey.id}) from chat...`);
            await sock.sendMessage(targetJid, {
                delete: {
                    remoteJid: targetJid,
                    id: trackedData.descKey.id,
                    fromMe: true
                }
            });
        } catch (delError) {
            console.warn('⚠️ Could not delete details description message:', delError.message);
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

module.exports = {
    activeSentPolls,
    pendingConsultantInquiries,
    registerSentPoll,
    getTrackedPoll,
    tryDecryptPollVote,
    processInquiryDecision
};
