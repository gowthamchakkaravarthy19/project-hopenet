import { useState, useEffect } from 'react';
import { getClaimedItems } from '../api/posts';
import PostCard from '../components/PostCard';
import useGeolocation from '../hooks/useGeolocation';
import toast from 'react-hot-toast';

const ClaimedItems = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { location: userLocation } = useGeolocation();

    useEffect(() => {
        getClaimedItems()
            .then((res) => {
                setPosts(res.data.posts);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                toast.error('Failed to fetch claimed items');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="page-container py-12">
                <div className="h-8 bg-gray-200 rounded w-64 mb-8 skeleton"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="card overflow-hidden">
                            <div className="relative aspect-[4/3] bg-gray-200 skeleton"></div>
                            <div className="p-4 space-y-3">
                                <div className="h-5 bg-gray-200 rounded w-3/4 skeleton"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 skeleton"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="page-container py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Claimed Items</h1>
            <p className="text-gray-600 mb-8">A history of all the donations that you have successfully claimed.</p>

            {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {posts.map((post) => (
                        <PostCard key={post._id} post={post} userLocation={userLocation} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 card-static bg-white px-4">
                    <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-primary-500 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Claimed Items Yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        Requests you send that are accepted by donors will appear here. Build your history by finding nearby donations!
                    </p>
                </div>
            )}
        </div>
    );
};

export default ClaimedItems;
