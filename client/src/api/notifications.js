import api from './axios';

export const getNotifications = (params) => api.get('/api/notifications', { params });
export const getUnreadCount = () => api.get('/api/notifications/unread-count');
export const markAsRead = (id) => api.patch(`/api/notifications/${id}/read`);
export const markAllAsRead = () => api.patch('/api/notifications/mark-all-read');
