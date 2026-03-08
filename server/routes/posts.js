const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const profileGate = require('../middleware/profileGate');
const { upload } = require('../config/cloudinary');
const { findNearbyReceivers } = require('../utils/geospatial');
const { sendPushNotification } = require('../config/webpush');

const router = express.Router();

// Rate limit: 5 posts per donor per 24h
const createPostLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 5,
    keyGenerator: (req) => req.user?._id?.toString() || req.ip,
    message: { message: 'You can create a maximum of 5 posts per 24 hours' },
});

// Create post (donor only)
router.post(
    '/',
    auth,
    requireRole('donor'),
    profileGate,
    createPostLimiter,
    (req, res, next) => {
        upload.array('images', 4)(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message || 'Image upload failed' });
            }
            next();
        });
    },
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('description').trim().notEmpty().withMessage('Description is required'),
        body('category').isIn(['food', 'clothing', 'groceries', 'medicine', 'other']).withMessage('Invalid category'),
        body('contactNumber').trim().notEmpty().withMessage('Contact number is required'),
        body('latitude').isFloat().withMessage('Latitude is required'),
        body('longitude').isFloat().withMessage('Longitude is required'),
        body('expiresIn').isInt({ min: 1, max: 72 }).withMessage('Expiry hours must be between 1 and 72'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { title, description, category, contactNumber, latitude, longitude, expiresIn, address } = req.body;
            const images = req.files ? req.files.map((f) => f.path || `/uploads/${f.filename}`) : [];

            const post = new Post({
                donorId: req.user._id,
                title,
                description,
                category,
                images,
                location: {
                    type: 'Point',
                    coordinates: [parseFloat(longitude), parseFloat(latitude)],
                },
                address: address || '',
                contactNumber,
                expiresAt: new Date(Date.now() + parseInt(expiresIn) * 60 * 60 * 1000),
            });

            await post.save();
            await post.populate('donorId', 'fullName profileImage');

            // Find nearby receivers and notify them
            const nearbyReceivers = await findNearbyReceivers(
                parseFloat(longitude),
                parseFloat(latitude)
            );

            const io = req.app.get('io');

            for (const receiver of nearbyReceivers) {
                // Create in-app notification
                const notification = await Notification.create({
                    receiverId: receiver._id,
                    postId: post._id,
                    message: `New donation nearby: "${title}"`,
                    type: 'new_donation',
                });

                // Emit socket event
                if (io) {
                    io.to(receiver._id.toString()).emit('new_donation', {
                        notification: await notification.populate('postId'),
                        post,
                    });
                }

                // Send push notification
                if (receiver.pushSubscription) {
                    sendPushNotification(receiver.pushSubscription, {
                        title: 'New Donation Nearby!',
                        body: `${title} — ${post.category}`,
                        data: { postId: post._id },
                    });
                }
            }

            res.status(201).json({ post, message: 'Post created successfully' });
        } catch (error) {
            console.error('Create post error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Get nearby posts (receiver)
router.get('/nearby', auth, profileGate, async (req, res) => {
    try {
        const { latitude, longitude, maxDistance = 10000, category, sort = 'newest', page = 1, limit = 12 } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Location coordinates required' });
        }

        const lng = parseFloat(longitude);
        const lat = parseFloat(latitude);
        const dist = parseInt(maxDistance);
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {
            status: 'active',
            expiresAt: { $gt: new Date() },
        };

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (sort === 'newest') {
            filter.location = {
                $geoWithin: {
                    $centerSphere: [[lng, lat], dist / 6378100] // Earth radius in meters
                }
            };
        } else {
            // sort === 'nearest'
            filter.location = {
                $near: {
                    $geometry: { type: 'Point', coordinates: [lng, lat] },
                    $maxDistance: dist,
                },
            };
        }

        let query = Post.find(filter)
            .populate('donorId', 'fullName profileImage')
            .skip(skip)
            .limit(parseInt(limit));

        if (sort === 'newest') {
            query = query.sort({ createdAt: -1 });
        }
        // 'nearest' is implicitly sorted by $near

        const posts = await query;
        const total = await Post.countDocuments({
            ...filter,
            location: {
                $geoWithin: {
                    $centerSphere: [[lng, lat], dist / 6378100]
                }
            }
        });

        res.json({
            posts,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
        });
    } catch (error) {
        console.error('Get nearby posts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get donor's own posts
router.get('/my', auth, requireRole('donor'), async (req, res) => {
    try {
        const { status, page = 1, limit = 12 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = { donorId: req.user._id };
        if (status && status !== 'all') {
            filter.status = status;
        }

        const posts = await Post.find(filter)
            .populate('donorId', 'fullName profileImage')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Post.countDocuments(filter);
        const stats = await Post.aggregate([
            { $match: { donorId: req.user._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const statsMap = { total: 0, active: 0, fulfilled: 0, expired: 0 };
        stats.forEach((s) => {
            statsMap[s._id] = s.count;
            statsMap.total += s.count;
        });

        res.json({
            posts,
            stats: statsMap,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
        });
    } catch (error) {
        console.error('Get my posts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all incoming requests for a donor
router.get('/my-requests', auth, requireRole('donor'), async (req, res) => {
    try {
        // Find all active posts by this donor that have pending requests
        const posts = await Post.find({
            donorId: req.user._id,
            status: 'active',
            'requests.0': { $exists: true }
        })
            .populate('requests.receiverId', 'fullName profileImage mobile')
            .sort({ updatedAt: -1 });

        // Flatten requests into a feed format
        let allRequests = [];
        posts.forEach(post => {
            post.requests.forEach(reqObj => {
                if (reqObj.status === 'pending') {
                    allRequests.push({
                        requestId: reqObj._id,
                        post: {
                            _id: post._id,
                            title: post.title,
                            category: post.category,
                            images: post.images
                        },
                        receiver: reqObj.receiverId,
                        message: reqObj.message,
                        status: reqObj.status,
                        createdAt: reqObj.createdAt
                    });
                }
            });
        });

        // Sort descending by created date
        allRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({ requests: allRequests });
    } catch (error) {
        console.error('Get donor requests error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get stats for landing page (MUST be before /:id route)
router.get('/stats/public', async (req, res) => {
    try {
        const totalDonations = await Post.countDocuments({ status: { $ne: 'deleted' } });
        const activePosts = await Post.countDocuments({ status: 'active', expiresAt: { $gt: new Date() } });
        const ngosRegistered = await User.countDocuments({ role: 'receiver' });
        res.json({ totalDonations, activePosts, ngosRegistered });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get claimed/accepted items for receiver
router.get('/claims', auth, requireRole('receiver'), async (req, res) => {
    try {
        const posts = await Post.find({
            'requests': {
                $elemMatch: { receiverId: req.user._id, status: 'accepted' }
            }
        })
            .populate('donorId', 'fullName profileImage mobile')
            .sort({ updatedAt: -1 });

        res.json({ posts });
    } catch (error) {
        console.error('Get claims error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single post
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('donorId', 'fullName profileImage mobile')
            .populate('requests.receiverId', 'fullName profileImage mobile');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ post });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update post (donor only, own posts)
router.put(
    '/:id',
    auth,
    requireRole('donor'),
    upload.array('images', 4),
    async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }
            if (post.donorId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }

            const { title, description, category, contactNumber, latitude, longitude, address, expiresIn } = req.body;

            if (title) post.title = title;
            if (description) post.description = description;
            if (category) post.category = category;
            if (contactNumber) post.contactNumber = contactNumber;
            if (address) post.address = address;
            if (latitude && longitude) {
                post.location = {
                    type: 'Point',
                    coordinates: [parseFloat(longitude), parseFloat(latitude)],
                };
            }
            if (expiresIn) {
                post.expiresAt = new Date(Date.now() + parseInt(expiresIn) * 60 * 60 * 1000);
            }
            if (req.files && req.files.length > 0) {
                const newImages = req.files.map((f) => f.path);
                post.images = [...post.images, ...newImages].slice(0, 4);
            }

            await post.save();
            res.json({ post, message: 'Post updated' });
        } catch (error) {
            console.error('Update post error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Update post status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Only donors can change the status
        if (post.donorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (status === 'fulfilled' || status === 'deleted') {
            post.status = status;
        } else {
            return res.status(400).json({ message: 'Invalid status' });
        }

        await post.save();
        res.json({ post, message: `Post ${status}` });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Request a donation (receiver only)
router.post('/:id/request', auth, requireRole('receiver'), async (req, res) => {
    try {
        const { message } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.status !== 'active' || post.expiresAt < new Date()) {
            return res.status(400).json({ message: 'This donation is no longer available' });
        }

        // Check if already requested
        if (post.requests.some(reqInfo => reqInfo.receiverId.toString() === req.user._id.toString())) {
            return res.status(400).json({ message: 'You have already requested this donation' });
        }

        // Add request
        post.requests.push({ receiverId: req.user._id, message: message || '' });
        await post.save();

        // Notify donor
        const notification = await Notification.create({
            receiverId: post.donorId,
            postId: post._id,
            message: `${req.user.fullName} has requested your donation "${post.title}"`,
            type: 'request',
        });

        const io = req.app.get('io');
        if (io) {
            io.to(post.donorId.toString()).emit('new_request', { notification, post });
        }

        res.json({ message: 'Request sent successfully' });
    } catch (error) {
        console.error('Request donation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reject a donation request (donor only)
router.patch('/:id/request/:receiverId/reject', auth, requireRole('donor'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Verify the user is the donor of this post
        if (post.donorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to manage these requests' });
        }

        // Find the specific request
        const requestToReject = post.requests.find(
            (r) => r.receiverId.toString() === req.params.receiverId
        );

        if (!requestToReject) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Check if already rejected
        if (requestToReject.status === 'rejected') {
            return res.status(400).json({ message: 'Request is already rejected' });
        }

        requestToReject.status = 'rejected';
        await post.save();

        // Notify the receiver
        const notification = await Notification.create({
            receiverId: req.params.receiverId,
            postId: post._id,
            message: `Your request for the donation "${post.title}" has been declined by the donor.`,
            type: 'request_rejected',
        });

        const io = req.app.get('io');
        if (io) {
            io.to(req.params.receiverId.toString()).emit('new_notification', notification);
        }

        res.json({ message: 'Request rejected successfully', post });
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Accept a donation request (donor only)
router.patch('/:id/request/:receiverId/accept', auth, requireRole('donor'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Verify the user is the donor
        if (post.donorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to manage these requests' });
        }

        // Find the specific request
        const requestToAccept = post.requests.find(
            (r) => r.receiverId.toString() === req.params.receiverId
        );

        if (!requestToAccept) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (requestToAccept.status === 'accepted') {
            return res.status(400).json({ message: 'Request is already accepted' });
        }

        // Accept this request and reject all others automatically
        post.requests.forEach(reqObj => {
            if (reqObj.receiverId.toString() === req.params.receiverId) {
                reqObj.status = 'accepted';
            } else if (reqObj.status === 'pending') {
                reqObj.status = 'rejected';
            }
        });

        // Fulfill the post entirely
        post.status = 'fulfilled';
        await post.save();

        // Notify the receiver
        const notification = await Notification.create({
            receiverId: req.params.receiverId,
            postId: post._id,
            message: `Your request for the donation "${post.title}" has been accepted! You can now coordinate pickup.`,
            type: 'request_accepted',
        });

        const io = req.app.get('io');
        if (io) {
            io.to(req.params.receiverId.toString()).emit('new_notification', notification);
            // Optionally notify others that their requests were rejected
            post.requests.forEach(async (reqObj) => {
                if (reqObj.receiverId.toString() !== req.params.receiverId && reqObj.status === 'rejected') {
                    const rejectionNotice = await Notification.create({
                        receiverId: reqObj.receiverId,
                        postId: post._id,
                        message: `The donation "${post.title}" was fulfilled to someone else.`,
                        type: 'request_rejected',
                    });
                    io.to(reqObj.receiverId.toString()).emit('new_notification', rejectionNotice);
                }
            });
        }

        res.json({ message: 'Request accepted successfully', post });
    } catch (error) {
        console.error('Accept request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete post
router.delete('/:id', auth, requireRole('donor'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        if (post.donorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        post.status = 'deleted';
        await post.save();
        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// (stats/public route moved above /:id to prevent route collision)

module.exports = router;
