import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineBell, HiOutlineCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getNotifications, markAsRead, markAllAsRead } from '../api/notifications';
import { timeAgo } from '../utils/timeRemaining';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import useNotifications from '../hooks/useNotifications';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { fetchUnreadCount } = useNotifications();

    useEffect(() => {
        getNotifications()
            .then((res) => { setNotifications(res.data.notifications); setLoading(false); })
            .catch(() => { toast.error('Failed to load'); setLoading(false); });
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            fetchUnreadCount();
            toast.success('All marked as read');
        } catch { toast.error('Failed'); }
    };

    const handleMarkRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
            fetchUnreadCount();
        } catch { }
    };

    return (
        <div className="page-container max-w-2xl">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                {notifications.some((n) => !n.isRead) && (
                    <button onClick={handleMarkAllRead} className="btn-ghost text-sm flex items-center gap-1">
                        <HiOutlineCheck className="w-4 h-4" /> Mark all read
                    </button>
                )}
            </div>
            {loading ? (
                <div className="space-y-3">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-20" />)}</div>
            ) : notifications.length === 0 ? (
                <EmptyState icon={<HiOutlineBell className="w-12 h-12 text-gray-400" />} title="No notifications" description="You'll see notifications when new donations are posted nearby." />
            ) : (
                <div className="space-y-2">
                    {notifications.map((n) => (
                        <Link key={n._id} to={n.postId ? `/post/${n.postId._id || n.postId}` : '#'} onClick={() => !n.isRead && handleMarkRead(n._id)}
                            className={`card-static p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors block ${!n.isRead ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${n.type === 'new_donation' ? 'bg-primary-100 text-primary-600' : n.type === 'claimed' ? 'bg-accent-100 text-accent-600' : 'bg-gray-100 text-gray-500'}`}>
                                {n.type === 'new_donation' ? '🎁' : n.type === 'claimed' ? '✅' : '🔔'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{n.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                            </div>
                            {!n.isRead && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
