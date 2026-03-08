import { useState, useEffect, useCallback } from 'react';
import { getUnreadCount } from '../api/notifications';
import { useSocket } from '../context/SocketContext';

const useNotifications = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const socket = useSocket();

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await getUnreadCount();
            setUnreadCount(res.data.count);
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    useEffect(() => {
        if (!socket) return;

        const handleNewDonation = () => {
            setUnreadCount((prev) => prev + 1);
        };

        const handlePostClaimed = () => {
            setUnreadCount((prev) => prev + 1);
        };

        socket.on('new_donation', handleNewDonation);
        socket.on('post_claimed', handlePostClaimed);

        return () => {
            socket.off('new_donation', handleNewDonation);
            socket.off('post_claimed', handlePostClaimed);
        };
    }, [socket]);

    return { unreadCount, setUnreadCount, fetchUnreadCount };
};

export default useNotifications;
