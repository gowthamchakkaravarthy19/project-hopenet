const User = require('../models/User');

/**
 * Find all receivers within a given radius of a point
 */
const findNearbyReceivers = async (longitude, latitude, maxDistanceMeters = 10000) => {
    try {
        const receivers = await User.find({
            role: 'receiver',
            isProfileComplete: true,
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [longitude, latitude] },
                    $maxDistance: maxDistanceMeters,
                },
            },
        });
        return receivers;
    } catch (error) {
        console.error('Geospatial query error:', error);
        return [];
    }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const toRad = (deg) => (deg * Math.PI) / 180;

module.exports = { findNearbyReceivers, calculateDistance };
