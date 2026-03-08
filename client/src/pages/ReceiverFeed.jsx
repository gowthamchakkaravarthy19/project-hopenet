import { useState, useEffect } from 'react';
import { HiOutlineFilter, HiOutlineMap } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getNearbyPosts } from '../api/posts';
import { updateLocation } from '../api/users';
import useGeolocation from '../hooks/useGeolocation';
import PostCard from '../components/PostCard';
import { FeedSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const distances = [
    { value: 5000, label: '5 km' },
    { value: 10000, label: '10 km' },
    { value: 25000, label: '25 km' },
];
const cats = ['all', 'food', 'clothing', 'groceries', 'medicine', 'other'];

const ReceiverFeed = () => {
    const { location, loading: geoLoading, error: geoError } = useGeolocation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('all');
    const [maxDistance, setMaxDistance] = useState(10000);
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchPosts = async () => {
        if (!location) return;
        try {
            setLoading(true);
            const res = await getNearbyPosts({
                latitude: location.latitude,
                longitude: location.longitude,
                maxDistance, category, sort, page,
            });
            setPosts(page === 1 ? res.data.posts : (prev) => [...prev, ...res.data.posts]);
            setTotalPages(res.data.totalPages);
        } catch { toast.error('Failed to load donations'); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (location) {
            updateLocation({ latitude: location.latitude, longitude: location.longitude }).catch(() => { });
            fetchPosts();
        }
    }, [location, category, maxDistance, sort, page]);

    useEffect(() => { setPage(1); }, [category, maxDistance, sort]);

    if (geoLoading) return <div className="page-container text-center py-20"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-gray-500">Detecting your location...</p></div>;
    if (geoError) return <div className="page-container"><EmptyState title="Location Required" description="Please enable location access to see nearby donations." /></div>;

    return (
        <div className="page-container">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Nearby Donations</h1>
                    <p className="text-gray-500 mt-1">Find donations close to you</p>
                </div>
                <Link to="/map" className="btn-outline flex items-center gap-2 text-sm">
                    <HiOutlineMap className="w-4 h-4" /> Map View
                </Link>
            </div>
            {/* Filters */}
            <div className="card-static p-4 mb-6 flex flex-wrap items-center gap-3">
                <HiOutlineFilter className="w-5 h-5 text-gray-400" />
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                    {cats.map((c) => (
                        <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all capitalize ${category === c ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {c}
                        </button>
                    ))}
                </div>
                <div className="h-6 w-px bg-gray-200 hidden sm:block" />
                <select value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                    {distances.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                    <option value="newest">Newest</option>
                    <option value="nearest">Nearest</option>
                </select>
            </div>
            {/* Posts */}
            {loading && page === 1 ? <FeedSkeleton /> : posts.length === 0 ? (
                <EmptyState title="No donations nearby" description="There are no active donations within your selected radius. Try increasing the distance." />
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => <PostCard key={post._id} post={post} userLocation={location} />)}
                    </div>
                    {page < totalPages && (
                        <div className="text-center mt-8">
                            <button onClick={() => setPage((p) => p + 1)} disabled={loading} className="btn-outline">
                                {loading ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ReceiverFeed;
