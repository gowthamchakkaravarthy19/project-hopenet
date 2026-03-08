import api from './axios';

export const getProfile = () => api.get('/api/users/profile');
export const updateProfile = (formData) =>
    api.put('/api/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateSettings = (data) => api.put('/api/users/settings', data);
export const updateLocation = (data) => api.put('/api/users/location', data);
export const savePushSubscription = (subscription) =>
    api.post('/api/users/push-subscription', { subscription });
export const completeProfile = (formData) =>
    api.put('/api/auth/complete-profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
