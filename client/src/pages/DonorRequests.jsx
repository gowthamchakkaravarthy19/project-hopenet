import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiCheck, HiX } from 'react-icons/hi';
import { getDonorRequests, acceptRequest, rejectRequest } from '../api/posts';
import EmptyState from '../components/EmptyState';

const DonorRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await getDonorRequests();
            setRequests(res.data.requests);
        } catch {
            toast.error('Failed to load your requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAccept = async (postId, receiverId) => {
        try {
            await acceptRequest(postId, receiverId);
            toast.success('Request accepted! They have been notified.');
            fetchRequests(); // Refresh the feed
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept request');
        }
    };

    const handleReject = async (postId, receiverId) => {
        try {
            await rejectRequest(postId, receiverId);
            toast.success('Request rejected.');
            fetchRequests(); // Refresh the feed
        } catch (err) {
            toast.error('Failed to reject request');
        }
    };

    return (
        <div className="page-container max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Requests</h1>
            <p className="text-gray-500 mb-8">Manage the people asking for your active donations</p>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card p-6 animate-pulse">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="w-1/3 h-5 bg-gray-200 rounded" />
                                    <div className="w-1/4 h-4 bg-gray-200 rounded" />
                                    <div className="w-full h-16 bg-gray-200 rounded mt-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : requests.length === 0 ? (
                <EmptyState
                    title="No pending requests"
                    description="When people request your donations, they will appear here."
                />
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => (
                        <div key={req.requestId} className="card p-5 sm:p-6 transition-all hover:border-primary-200">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 sm:gap-6">
                                {/* Receiver Info */}
                                <div className="flex gap-4 items-center sm:flex-1 w-full">
                                    <img
                                        src={req.receiver.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.receiver.fullName)}&background=random`}
                                        alt={req.receiver.fullName}
                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-gray-100 flex-shrink-0"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{req.receiver.fullName}</h3>
                                        <p className="text-sm text-gray-500">Requested <span className="text-primary-600 font-medium">"{req.post.title}"</span></p>
                                        <p className="text-xs text-gray-400 mt-1 block">
                                            {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleAccept(req.post._id, req.receiver._id)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white border border-primary-200 transition-colors rounded-xl font-medium"
                                    >
                                        <HiCheck className="w-5 h-5" /> Accept
                                    </button>
                                    <button
                                        onClick={() => handleReject(req.post._id, req.receiver._id)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-200 transition-colors rounded-xl font-medium"
                                    >
                                        <HiX className="w-5 h-5" /> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DonorRequests;
