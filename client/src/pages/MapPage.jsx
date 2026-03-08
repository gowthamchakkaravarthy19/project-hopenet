import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineLocationMarker, HiOutlineClock, HiOutlinePhone, HiOutlineViewList } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getNearbyPosts } from '../api/posts';
import useGeolocation from '../hooks/useGeolocation';
import { getTimeRemaining } from '../utils/timeRemaining';
import { formatDistance, calculateDistance } from '../utils/formatDistance';
import EmptyState from '../components/EmptyState';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const catColor = { food: '#F97316', clothing: '#3B82F6', groceries: '#10B981', medicine: '#EF4444', other: '#6B7280' };

// Component to recenter map when location changes or post is selected
const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

// Create custom colored markers based on category
const createCustomIcon = (color) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
};

const userIcon = L.divIcon({
    className: 'user-marker',
    html: `<div style="background-color: #3B82F6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #3B82F640, 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

const MapPage = () => {
    const { location, loading: geoLoading } = useGeolocation();
    const [posts, setPosts] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mapCenter, setMapCenter] = useState(null);

    useEffect(() => {
        if (!location) return;
        setMapCenter([location.latitude, location.longitude]);
        getNearbyPosts({ latitude: location.latitude, longitude: location.longitude, maxDistance: 25000, limit: 50 })
            .then((res) => { setPosts(res.data.posts); setLoading(false); })
            .catch(() => { toast.error('Failed to load'); setLoading(false); });
    }, [location]);

    if (geoLoading) return <div className="page-container text-center py-20"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-gray-500">Detecting your location...</p></div>;

    const handleSelectPost = (postId, coords) => {
        setSelected(postId);
        setMapCenter([coords[1], coords[0]]);
    };

    return (
        <div className="page-container">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Map View</h1>
                    <p className="text-gray-500 mt-1">Donations around you</p>
                </div>
                <Link to="/feed" className="btn-outline flex items-center gap-2 text-sm"><HiOutlineViewList className="w-4 h-4" /> List View</Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Interactive Leaflet Map */}
                <div className="lg:col-span-2 card-static overflow-hidden h-[500px] z-0">
                    {location ? (
                        <MapContainer
                            center={[location.latitude, location.longitude]}
                            zoom={13}
                            style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapUpdater center={mapCenter} />

                            {/* User Location */}
                            <Marker position={[location.latitude, location.longitude]} icon={userIcon}>
                                <Popup>You are here</Popup>
                            </Marker>

                            {/* Donation Markers */}
                            {posts.map(post => (
                                <Marker
                                    key={post._id}
                                    position={[post.location.coordinates[1], post.location.coordinates[0]]}
                                    icon={createCustomIcon(catColor[post.category] || catColor.other)}
                                    eventHandlers={{
                                        click: () => handleSelectPost(post._id, post.location.coordinates),
                                    }}
                                >
                                    <Popup className="donation-popup">
                                        <div className="w-48">
                                            {post.images?.[0] && <img src={post.images[0]} alt="" className="w-full h-24 object-cover rounded-md mb-2" />}
                                            <h4 className="font-bold text-gray-900 mb-1 leading-tight">{post.title}</h4>
                                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{post.description}</p>
                                            <Link to={`/post/${post._id}`} className="text-xs font-semibold text-primary-600 hover:text-primary-700">View Details &rarr;</Link>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    ) : (
                        <div className="bg-gray-100 h-full flex flex-col items-center justify-center text-center p-8">
                            <HiOutlineLocationMarker className="w-12 h-12 text-gray-400 mb-4" />
                            <p className="text-gray-500">Location permission required to load map.</p>
                        </div>
                    )}
                </div>

                {/* Side panel */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-hide pr-2">
                    {loading ? (
                        Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)
                    ) : posts.length === 0 ? (
                        <EmptyState title="No donations nearby" description="Check back later." />
                    ) : (
                        posts.map((post) => {
                            const dist = location ? calculateDistance(location.latitude, location.longitude, post.location.coordinates[1], post.location.coordinates[0]) : null;
                            const time = getTimeRemaining(post.expiresAt);
                            return (
                                <div key={post._id}
                                    onClick={() => handleSelectPost(post._id, post.location.coordinates)}
                                    className={`card-static p-4 block hover:bg-gray-50 transition-colors cursor-pointer ${selected === post._id ? 'ring-2 ring-primary-500' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        {post.images?.[0] && <img src={post.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2 truncate">
                                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: catColor[post.category] || '#6B7280' }} />
                                                    <h4 className="font-semibold text-gray-900 text-sm truncate">{post.title}</h4>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                                                {dist != null && <span className="flex items-center gap-1"><HiOutlineLocationMarker className="w-3.5 h-3.5" />{formatDistance(dist)}</span>}
                                                <span className="flex items-center gap-1"><HiOutlineClock className="w-3.5 h-3.5" />{time.text}</span>
                                            </div>
                                            <Link to={`/post/${post._id}`} className="text-xs font-semibold text-primary-600 hover:text-primary-700 mt-1 inline-block">
                                                Request
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default MapPage;
