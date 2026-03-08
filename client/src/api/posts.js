import api from './axios';

export const getNearbyPosts = (params) => api.get('/api/posts/nearby', { params });
export const getMyPosts = (params) => api.get('/api/posts/my', { params });
export const getPost = (id) => api.get(`/api/posts/${id}`);
export const createPost = (formData) =>
    api.post('/api/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updatePost = (id, formData) =>
    api.put(`/api/posts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updatePostStatus = async (id, status) => {
    return await api.patch(`/api/posts/${id}/status`, { status });
};

export const deletePost = async (id) => {
    return await api.delete(`/api/posts/${id}`);
};

export const requestDonation = async (id, message) => {
    return await api.post(`/api/posts/${id}/request`, { message });
};

export const rejectRequest = async (id, receiverId) => {
    return await api.patch(`/api/posts/${id}/request/${receiverId}/reject`);
};

export const acceptRequest = async (id, receiverId) => {
    return await api.patch(`/api/posts/${id}/request/${receiverId}/accept`);
};

export const getClaimedItems = async () => {
    return await api.get('/api/posts/claims');
};

export const getDonorRequests = async () => {
    return await api.get('/api/posts/my-requests');
};

export const getPublicStats = () => api.get('/api/posts/stats/public');
