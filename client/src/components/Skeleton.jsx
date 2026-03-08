const Skeleton = ({ className = '', count = 1 }) => {
    return (
        <>
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className={`skeleton rounded-lg ${className}`} />
            ))}
        </>
    );
};

export const PostCardSkeleton = () => (
    <div className="card-static overflow-hidden">
        <div className="skeleton aspect-[4/3]" />
        <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <Skeleton className="w-7 h-7 !rounded-full" />
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
    </div>
);

export const FeedSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, i) => (
            <PostCardSkeleton key={i} />
        ))}
    </div>
);

export default Skeleton;
