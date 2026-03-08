const profileGate = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    if (!req.user.isProfileComplete) {
        return res.status(403).json({
            message: 'Profile completion required',
            code: 'PROFILE_INCOMPLETE'
        });
    }
    next();
};

module.exports = profileGate;
