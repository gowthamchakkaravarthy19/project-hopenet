import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineFilter } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getMyPosts, updatePostStatus, deletePost } from '../api/posts';
import PostCard from '../components/PostCard';
import { PostCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const DonorDashboard = () => {
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, fulfilled: 0, expired: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [modal, setModal] = useState({ open: false, action: null, postId: null });

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await getMyPosts({ status: filter });
            setPosts(res.data.posts);
            setStats(res.data.stats);
        } catch {
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, [filter]);

    const handleFulfill = async () => {
        try {
            await updatePostStatus(modal.postId, 'fulfilled');
            toast.success('Post marked as fulfilled!');
            setModal({ open: false });
            fetchPosts();
        } catch {
            toast.error('Failed to update post');
        }
    };

    const handleDelete = async () => {
        try {
            await deletePost(modal.postId);
            toast.success('Post deleted');
            setModal({ open: false });
            fetchPosts();
        } catch {
            toast.error('Failed to delete post');
        }
    };

    const statCards = [
        { label: 'Total Posts', value: stats.total, color: 'bg-blue-50 text-blue-700' },
        { label: 'Active', value: stats.active, color: 'bg-green-50 text-green-700' },
        { label: 'Fulfilled', value: stats.fulfilled, color: 'bg-primary-50 text-primary-700' },
        { label: 'Expired', value: stats.expired, color: 'bg-gray-50 text-gray-600' },
    ];

    const filters = [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'fulfilled', label: 'Fulfilled' },
        { value: 'expired', label: 'Expired' },
    ];

    return (
        <div className="page-container">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage your donations</p>
                </div>
                <Link to="/create-post" className="btn-primary flex items-center gap-2">
                    <HiOutlinePlus className="w-5 h-5" />
                    Create Post
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((s) => (
                    <div key={s.label} className={`card-static p-4 ${s.color}`}>
                        <p className="text-2xl sm:text-3xl font-bold">{s.value}</p>
                        <p className="text-sm font-medium opacity-80">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide">
                <HiOutlineFilter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                {filters.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === f.value
                                ? 'bg-primary-500 text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Posts grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }, (_, i) => <PostCardSkeleton key={i} />)}
                </div>
            ) : posts.length === 0 ? (
                <EmptyState
                    title="No posts yet"
                    description="Create your first donation post and help someone nearby."
                    action={
                        <Link to="/create-post" className="btn-primary flex items-center gap-2">
                            <HiOutlinePlus className="w-5 h-5" /> Create Post
                        </Link>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <div key={post._id} className="relative group">
                            <PostCard post={post} />
                            {post.status === 'active' && (
                                <div className="absolute top-3 right-14 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.preventDefault(); setModal({ open: true, action: 'fulfill', postId: post._id }); }}
                                        className="px-2.5 py-1 bg-primary-500 text-white text-xs rounded-full font-medium shadow-sm hover:bg-primary-600"
                                    >
                                        ✓ Fulfill
                                    </button>
                                    <button
                                        onClick={(e) => { e.preventDefault(); setModal({ open: true, action: 'delete', postId: post._id }); }}
                                        className="px-2.5 py-1 bg-red-500 text-white text-xs rounded-full font-medium shadow-sm hover:bg-red-600"
                                    >
                                        ✕ Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={modal.open && modal.action === 'fulfill'}
                onClose={() => setModal({ open: false })}
                onConfirm={handleFulfill}
                title="Mark as Fulfilled?"
                message="This will mark the donation as collected. This action cannot be undone."
                confirmText="Mark Fulfilled"
                variant="success"
            />

            <Modal
                isOpen={modal.open && modal.action === 'delete'}
                onClose={() => setModal({ open: false })}
                onConfirm={handleDelete}
                title="Delete Post?"
                message="This will permanently remove this donation post."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default DonorDashboard;
