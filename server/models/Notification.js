const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
        message: { type: String, required: true },
        type: { type: String, enum: ['new_donation', 'claimed', 'general', 'request', 'request_rejected', 'request_accepted'], default: 'new_donation' },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

notificationSchema.index({ receiverId: 1, createdAt: -1 });
notificationSchema.index({ receiverId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
