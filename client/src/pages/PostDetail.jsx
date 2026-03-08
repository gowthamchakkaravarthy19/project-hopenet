import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiOutlineClock, HiOutlineLocationMarker, HiOutlinePhone, HiOutlinePencil, HiArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getPost, requestDonation, updatePostStatus, rejectRequest, acceptRequest } from '../api/posts';
import useAuthStore from '../store/authStore';
import { getTimeRemaining } from '../utils/timeRemaining';
import Modal from '../components/Modal';
import useGeolocation from '../hooks/useGeolocation';

const categoryBadge = { food: 'badge-food', clothing: 'badge-clothing', groceries: 'badge-groceries', medicine: 'badge-medicine', other: 'badge-other' };

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);
    const { location: userLocation } = useGeolocation();

    // Modal states
    const [requestModal, setRequestModal] = useState(false);
    const [requestMsg, setRequestMsg] = useState('');
    const [fulfillModal, setFulfillModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPost = () => {
        getPost(id).then((res) => { setPost(res.data.post); setLoading(false); })
            .catch(() => { toast.error('Post not found'); navigate(-1); });
    };

    useEffect(() => {
        fetchPost();
    }, [id]);

    const handleRequest = async () => {
        try {
            setIsSubmitting(true);
            await requestDonation(id, requestMsg);
            toast.success('Request sent! The donor will be notified.');
            setRequestModal(false);
            setRequestMsg('');
            fetchPost(); // Refresh to get the updated requests array
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to send request'); }
        finally { setIsSubmitting(false); }
    };

    const handleReject = async (receiverId) => {
        try {
            await rejectRequest(id, receiverId);
            toast.success('Request rejected.');
            fetchPost();
        } catch (err) { toast.error('Failed to reject request'); }
    };

    const handleAccept = async (receiverId) => {
        try {
            await acceptRequest(id, receiverId);
            toast.success('Request accepted! Post marked as fulfilled.');
            fetchPost();
        } catch (err) { toast.error('Failed to accept request'); }
    };

    const handleFulfill = async () => {
        try {
            setIsSubmitting(true);
            await updatePostStatus(id, 'fulfilled');
            toast.success('Donation marked as fulfilled!');
            setFulfillModal(false);
            setPost((p) => ({ ...p, status: 'fulfilled' }));
        } catch (err) { toast.error('Failed to fulfill post'); }
        finally { setIsSubmitting(false); }
    };

    const getDirectionsUrl = () => {
        if (!post?.location?.coordinates) return '#';
        const [lng, lat] = post.location.coordinates;
        if (userLocation) {
            return `https://www.openstreetmap.org/directions?engine=osrm_car&route=${userLocation.latitude},${userLocation.longitude};${lat},${lng}`;
        }
        return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
    };

    if (loading) return <div className="page-container flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
    if (!post) return null;

    const timeInfo = getTimeRemaining(post.expiresAt);
    const isOwner = user?._id === post.donorId?._id;
    const isReceiver = user?.role === 'receiver';

    const userRequest = post.requests?.find(req => (req.receiverId?._id || req.receiverId) === user?._id);
    const hasRequested = !!userRequest;
    const isRejected = userRequest?.status === 'rejected';
    const isAccepted = userRequest?.status === 'accepted';
    const canRequest = isReceiver && post.status === 'active' && !timeInfo.expired && !hasRequested;

    return (
        <div className="page-container max-w-4xl">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors">
                <HiArrowLeft className="w-5 h-5" /> Back
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Images */}
                <div>
                    <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
                        {post.images?.[activeImg] ? (
                            <img src={post.images[activeImg]} alt={post.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                        )}
                    </div>
                    {post.images?.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                            {post.images.map((img, i) => (
                                <button key={i} onClick={() => setActiveImg(i)} className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-primary-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {/* Details */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`badge ${categoryBadge[post.category] || 'badge-other'} capitalize`}>{post.category}</span>
                        <span className={`badge ${post.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'} capitalize`}>{post.status}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{post.title}</h1>
                    <p className="text-gray-600 leading-relaxed mb-6">{post.description}</p>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-gray-600">
                            <HiOutlineClock className="w-5 h-5 text-primary-500" />
                            <span className={timeInfo.urgent ? 'text-red-600 font-semibold' : ''}>{timeInfo.text}</span>
                        </div>
                        {post.address && (
                            <div className="flex items-center gap-3 text-gray-600">
                                <HiOutlineLocationMarker className="w-5 h-5 text-primary-500" />
                                <span>{post.address}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-gray-600">
                            <HiOutlinePhone className="w-5 h-5 text-primary-500" />
                            <a href={`tel:${post.contactNumber}`} className="text-primary-600 font-medium hover:underline">{post.contactNumber}</a>
                        </div>
                    </div>

                    {/* Donor info */}
                    {post.donorId && (
                        <div className="card-static p-4 mb-6">
                            <div className="flex items-center gap-3">
                                {post.donorId.profileImage ? (
                                    <img src={post.donorId.profileImage} alt="" className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-lg">{post.donorId.fullName?.charAt(0)}</div>
                                )}
                                <div>
                                    <p className="font-semibold text-gray-900">{post.donorId.fullName}</p>
                                    <p className="text-sm text-gray-500">Donor</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                            {canRequest && (
                                <button onClick={() => setRequestModal(true)} className="btn-primary flex-1 flex items-center justify-center">
                                    Request Donation
                                </button>
                            )}
                            {isReceiver && hasRequested && !isRejected && !isAccepted && (
                                <button disabled className="btn-primary flex-1 flex items-center justify-center opacity-50 cursor-not-allowed">
                                    ✓ Request Sent
                                </button>
                            )}
                            {isReceiver && isAccepted && (
                                <button disabled className="flex-1 flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-green-600 bg-green-50 border-2 border-green-200 cursor-not-allowed text-center">
                                    ✅ Request Accepted
                                </button>
                            )}
                            {isReceiver && isRejected && (
                                <button disabled className="flex-1 flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-red-500 bg-red-50 border-2 border-red-200 cursor-not-allowed text-center">
                                    ❌ Rejected
                                </button>
                            )}
                            {post.status === 'active' && (
                                <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer" className="btn-outline flex-1 flex items-center justify-center text-center">
                                    Map
                                </a>
                            )}
                            {isOwner && post.status === 'active' && (
                                <Link to={`/post/${id}/edit`} className="btn-ghost flex items-center gap-2">
                                    <HiOutlinePencil className="w-4 h-4" /> Edit
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Requests List (Donor Only) */}
                    {isOwner && post.requests?.length > 0 && (
                        <div className="mt-8 border-t pt-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Requests ({post.requests.length})</h2>
                            <div className="space-y-4">
                                {post.requests.map((req, idx) => (
                                    <div key={idx} className="card-static p-4 border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                {req.receiverId?.profileImage ? (
                                                    <img src={req.receiverId.profileImage} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm">
                                                        {req.receiverId?.fullName?.charAt(0) || 'N'}
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="font-semibold text-gray-900 text-sm block">{req.receiverId?.fullName || 'Receiver'}</span>
                                                    {req.receiverId?.mobile && (
                                                        <a href={`tel:${req.receiverId.mobile}`} className="text-xs text-primary-600 hover:underline">{req.receiverId.mobile}</a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(req.createdAt).toLocaleDateString()}</span>
                                                {req.status === 'rejected' ? (
                                                    <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-md border border-red-200">Rejected</span>
                                                ) : req.status === 'accepted' ? (
                                                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200">Accepted</span>
                                                ) : (
                                                    post.status === 'active' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleAccept(req.receiverId?._id || req.receiverId)}
                                                                className="text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(req.receiverId?._id || req.receiverId)}
                                                                className="text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                        {req.message && (
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-1 italic">"{req.message}"</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {post.status === 'active' && (
                                <button onClick={() => setFulfillModal(true)} className="btn-primary w-full mt-4 !bg-green-600 hover:!bg-green-700">
                                    Mark as Fulfilled
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Request Modal */}
            <Modal isOpen={requestModal} onClose={() => setRequestModal(false)} onConfirm={handleRequest} isLoading={isSubmitting} title="Request Donation" confirmText="Send Request" variant="primary">
                <p className="text-gray-600 mb-4 text-sm">Send a message to the donor indicating your intent to pick up this donation.</p>
                <textarea
                    value={requestMsg}
                    onChange={(e) => setRequestMsg(e.target.value)}
                    placeholder="E.g., We can pick this up in 30 minutes. We're an NGO serving..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none h-24"
                />
            </Modal>

            {/* Fulfill Modal */}
            <Modal isOpen={fulfillModal} onClose={() => setFulfillModal(false)} onConfirm={handleFulfill} isLoading={isSubmitting} title="Mark as Fulfilled?" message="Are you sure you want to mark this donation as fulfilled? This indicates the goods have been collected." confirmText="Mark Fulfilled" variant="success" />

        </div>
    );
};

export default PostDetail;

