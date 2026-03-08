const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

const isProduction = process.env.NODE_ENV === 'production';

const setCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

// Register
router.post(
    '/register',
    [
        body('fullName').trim().notEmpty().withMessage('Full name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('mobile').trim().notEmpty().withMessage('Mobile number is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('role').isIn(['donor', 'receiver']).withMessage('Role must be donor or receiver'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { fullName, email, mobile, password, role } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already registered' });
            }

            const user = new User({
                fullName,
                email,
                mobile,
                passwordHash: password,
                role,
            });
            await user.save();

            const token = generateToken(user._id);
            setCookie(res, token);

            res.status(201).json({ user, message: 'Registration successful' });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Login
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            const user = await User.findOne({ email }).select('+passwordHash');
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = generateToken(user._id);
            setCookie(res, token);

            // Remove passwordHash from response
            const userObj = user.toJSON();
            res.json({ user: userObj, message: 'Login successful' });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Logout
router.post('/logout', (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        expires: new Date(0),
    });
    res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Complete profile
router.put(
    '/complete-profile',
    auth,
    upload.single('profileImage'),
    [
        body('dob').notEmpty().withMessage('Date of birth is required'),
        body('address').trim().notEmpty().withMessage('Address is required'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { dob, address, latitude, longitude } = req.body;
            const updateData = {
                dob: new Date(dob),
                address,
                isProfileComplete: true,
            };

            if (req.file) {
                updateData.profileImage = req.file.path;
            }

            if (latitude && longitude) {
                updateData.location = {
                    type: 'Point',
                    coordinates: [parseFloat(longitude), parseFloat(latitude)],
                };
            }

            const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
            res.json({ user, message: 'Profile completed' });
        } catch (error) {
            console.error('Complete profile error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

module.exports = router;
