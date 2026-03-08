const cron = require('node-cron');
const Post = require('../models/Post');

const startCronJobs = () => {
    // Run every 5 minutes — mark expired posts
    cron.schedule('*/5 * * * *', async () => {
        try {
            const result = await Post.updateMany(
                { status: 'active', expiresAt: { $lte: new Date() } },
                { status: 'expired' }
            );
            if (result.modifiedCount > 0) {
                console.log(`[Cron] Marked ${result.modifiedCount} posts as expired`);
            }
        } catch (error) {
            console.error('[Cron] Error expiring posts:', error);
        }
    });

    console.log('Cron jobs started');
};

module.exports = { startCronJobs };
