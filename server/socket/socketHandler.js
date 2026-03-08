const jwt = require('jsonwebtoken');

const setupSocket = (io) => {
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token ||
                socket.handshake.headers?.cookie?.split('token=')[1]?.split(';')[0];
            if (!token) {
                return next(new Error('Authentication required'));
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.userId}`);

        // Join user's own room  
        socket.join(socket.userId);

        socket.on('update_location', (data) => {
            // Client can periodically update their location
            console.log(`Location update from ${socket.userId}:`, data);
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.userId}`);
        });
    });
};

module.exports = setupSocket;
