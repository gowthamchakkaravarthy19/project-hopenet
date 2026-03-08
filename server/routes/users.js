const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Get own profile
router.get('/profile', auth, async (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update profile
router.put('/profile', auth, upload.single('profileImage'), async (req, res) => {
    try {
        const { fullName, address, mobile, latitude, longitude } = req.body;
        const updateData = {};

        if (fullName) updateData.fullName = fullName;
        if (address) updateData.address = address;
        if (mobile) updateData.mobile = mobile;
        if (req.file) updateData.profileImage = req.file.path;
        if (latitude && longitude) {
            updateData.location = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
            };
        }

        const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
        res.json({ user, message: 'Profile updated' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update settings
router.put('/settings', auth, async (req, res) => {
    try {
        const { notificationRadius, currentPassword, newPassword } = req.body;
        const updateData = {};

        if (notificationRadius) {
            updateData.notificationRadius = parseInt(notificationRadius);
        }

        if (currentPassword && newPassword) {
            const user = await User.findById(req.user._id).select('+passwordHash');
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            // Re-fetch user so the pre-save hook runs
            user.passwordHash = newPassword;
            await user.save();
        }

        if (Object.keys(updateData).length > 0) {
            await User.findByIdAndUpdate(req.user._id, updateData);
        }

        const user = await User.findById(req.user._id);
        res.json({ user, message: 'Settings updated' });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update location
router.put('/location', auth, async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Coordinates required' });
        }
        await User.findByIdAndUpdate(req.user._id, {
            location: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
        });
        res.json({ message: 'Location updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Save push subscription
router.post('/push-subscription', auth, async (req, res) => {
    try {
        const { subscription } = req.body;
        await User.findByIdAndUpdate(req.user._id, { pushSubscription: subscription });
        res.json({ message: 'Push subscription saved' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
