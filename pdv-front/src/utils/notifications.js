/**
 * Browser Notification and Sound Alert Service
 */

const STORAGE_KEY = 'pdv_notified_inquiry_ids';

/**
 * Play a professional system alert sound using Web Audio API
 */
export function playAlertSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Tone A5 (880 Hz) transitioning to A6 (1200 Hz)
        const osc1 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        
        osc1.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc1.start();
        osc1.stop(audioCtx.currentTime + 0.3);
        
        // Eco / Secondary bip
        setTimeout(() => {
            if (audioCtx.state === 'closed') return;
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1046.50, audioCtx.currentTime);
            gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.start();
            osc2.stop(audioCtx.currentTime + 0.25);
        }, 120);
        
    } catch (err) {
        console.warn('Web Audio API not supported or blocked by browser autoplay policy.', err);
    }
}

/**
 * Request desktop notification permissions
 */
export async function requestNotificationPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return false;
}

/**
 * Send a desktop notification
 */
export function sendDesktopNotification(title, options = {}) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
        new Notification(title, {
            icon: '/fav.png',
            badge: '/fav.png',
            ...options
        });
    } catch (err) {
        console.error('Error creating desktop notification:', err);
    }
}

/**
 * Load notified IDs from session storage
 */
function getNotifiedIds() {
    try {
        const data = sessionStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

/**
 * Save notified ID to session storage
 */
function markAsNotified(id) {
    try {
        const notified = getNotifiedIds();
        if (!notified.includes(id)) {
            notified.push(id);
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(notified));
        }
    } catch (e) {
        // Ignore
    }
}

/**
 * Check and notify if there are new pending inquiries
 * @param {Array} inquiries - List of inquiries from the API
 */
export async function checkNewPendingInquiries(inquiries) {
    if (!Array.isArray(inquiries)) return;

    const notifiedIds = getNotifiedIds();
    const pendingInquiries = inquiries.filter(
        inq => inq.assignment_status === 'pending' || inq.status === 'pending'
    );

    let hasNew = false;
    for (const inq of pendingInquiries) {
        const inqId = inq.inquiries_ID || inq.id;
        if (!notifiedIds.includes(inqId)) {
            hasNew = true;
            markAsNotified(inqId);
            
            // Trigger desktop notification
            sendDesktopNotification('📋 Nueva Consulta Pendiente', {
                body: `Cliente: ${inq.client_name}\nEmail: ${inq.client_email}`,
                tag: `pending_inquiry_${inqId}`
            });
        }
    }

    if (hasNew) {
        playAlertSound();
    }
}
