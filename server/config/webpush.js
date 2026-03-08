const webpush = require('web-push');

const setupWebPush = () => {
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        webpush.setVapidDetails(
            process.env.VAPID_EMAIL || 'mailto:dev@sharenear.com',
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
        console.log('Web Push configured');
    } else {
        console.warn('VAPID keys not configured — Web Push disabled');
    }
};

const sendPushNotification = async (subscription, payload) => {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        console.log('[Web Push Stub] Would send:', payload);
        return;
    }
    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
    } catch (error) {
        console.error('Web Push error:', error.message);
    }
};

module.exports = { setupWebPush, sendPushNotification };
