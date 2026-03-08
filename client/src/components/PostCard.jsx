import { Link } from 'react-router-dom';
import { HiOutlineClock, HiOutlineLocationMarker, HiOutlinePhone } from 'react-icons/hi';
import { getTimeRemaining } from '../utils/timeRemaining';
import { formatDistance, calculateDistance } from '../utils/formatDistance';

const categoryColors = {
    food: 'badge-food',
    clothing: 'badge-clothing',
    groceries: 'badge-groceries',
    medicine: 'badge-medicine',
    other: 'badge-other',
};

const PostCard = ({ post, userLocation }) => {
    const timeInfo = getTimeRemaining(post.expiresAt);

    const distance = userLocation && post.location?.coordinates
        ? calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            post.location.coordinates[1],
            post.location.coordinates[0]
        )
        : null;

    return (
        <Link to={`/post/${post._id}`} className="card overflow-hidden group block">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                {post.images?.[0] ? (
                    <img
                        src={post.images[0]}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                {/* Category badge */}
                <span className={`badge absolute top-3 left-3 ${categoryColors[post.category] || 'badge-other'} capitalize`}>
                    {post.category}
                </span>
                {/* Time remaining */}
                <div className={`absolute top-3 right-3 badge ${timeInfo.urgent ? 'bg-red-100 text-red-700' : 'bg-white/90 text-gray-700'} backdrop-blur-sm`}>
                    <HiOutlineClock className="w-3.5 h-3.5 mr-1" />
                    {timeInfo.text}
                </div>
                {/* Image count indicator */}
                {post.images?.length > 1 && (
                    <div className="absolute bottom-3 right-3 badge bg-black/60 text-white">
                        {post.images.length} photos
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {post.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-3">{post.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                    {distance != null && (
                        <span className="flex items-center gap-1">
                            <HiOutlineLocationMarker className="w-4 h-4 text-primary-500" />
                            {formatDistance(distance)}
                        </span>
                    )}
                    {post.contactNumber && (
                        <span className="flex items-center gap-1">
                            <HiOutlinePhone className="w-4 h-4" />
                            {post.contactNumber}
                        </span>
                    )}
                </div>

                {/* Donor info */}
                {post.donorId && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        {post.donorId.profileImage ? (
                            <img src={post.donorId.profileImage} alt="" className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                            <div className="w-7 h-7 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                {post.donorId.fullName?.charAt(0)}
                            </div>
                        )}
                        <span className="text-sm text-gray-600 font-medium">{post.donorId.fullName}</span>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default PostCard;
