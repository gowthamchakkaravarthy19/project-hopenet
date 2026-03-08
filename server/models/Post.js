const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        category: {
            type: String,
            enum: ['food', 'clothing', 'groceries', 'medicine', 'other'],
            required: true,
        },
        images: [{ type: String }],
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], required: true },
        },
        address: { type: String, trim: true },
        contactNumber: { type: String, required: true, trim: true },
        status: {
            type: String,
            enum: ['active', 'fulfilled', 'expired', 'deleted'],
            default: 'active',
        },
        expiresAt: { type: Date, required: true },
        requests: [{
            receiverId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            message: {
                type: String,
                trim: true,
            },
            status: {
                type: String,
                enum: ['pending', 'rejected', 'accepted'],
                default: 'pending'
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
    },
    { timestamps: true }
);

postSchema.index({ location: '2dsphere' });
postSchema.index({ status: 1, expiresAt: 1 });
postSchema.index({ donorId: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
