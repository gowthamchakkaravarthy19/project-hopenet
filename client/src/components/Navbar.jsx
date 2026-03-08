import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineBell, HiOutlineMenu, HiOutlineX, HiOutlineUser, HiOutlineCog, HiOutlineLogout } from 'react-icons/hi';
import useAuthStore from '../store/authStore';
import useNotifications from '../hooks/useNotifications';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setProfileOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navLinks = isAuthenticated && user?.isProfileComplete
        ? user.role === 'donor'
            ? [
                { path: '/dashboard', label: 'Dashboard' },
                { path: '/requests', label: 'Requests' },
                { path: '/create-post', label: 'Create Post' },
            ]
            : [
                { path: '/feed', label: 'Feed' },
                { path: '/map', label: 'Map View' },
                { path: '/claims', label: 'My Claims' },
            ]
        : [];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 glass border-b border-gray-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to={isAuthenticated ? (user?.role === 'donor' ? '/dashboard' : '/feed') : '/'} className="flex items-center gap-2 group">
                        <img src="/hopenet-logo.png" alt="HopeNet" className="h-10 w-auto object-contain drop-shadow-md group-hover:drop-shadow-lg transition-transform hover:scale-105" />
                        <span className="text-xl font-bold"><span className="text-[#152b4b]">Hope</span><span className="text-[#c8822a]">Net</span></span>
                    </Link>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive(link.path)
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {isAuthenticated ? (
                            <>
                                {/* Notifications */}
                                <Link
                                    to="/notifications"
                                    className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    <HiOutlineBell className="w-6 h-6" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Profile dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        {user.profileImage ? (
                                            <img src={user.profileImage} alt="" className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm">
                                                {user.fullName?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                                            {user.fullName}
                                        </span>
                                    </button>

                                    {profileOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-slide-down">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary-50 text-primary-700 rounded-full capitalize">
                                                    {user.role}
                                                </span>
                                            </div>
                                            <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                <HiOutlineUser className="w-4 h-4" /> Profile
                                            </Link>
                                            <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                <HiOutlineCog className="w-4 h-4" /> Settings
                                            </Link>
                                            <hr className="my-1 border-gray-100" />
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <HiOutlineLogout className="w-4 h-4" /> Log out
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile menu toggle */}
                                <button
                                    onClick={() => setMobileOpen(!mobileOpen)}
                                    className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                                >
                                    {mobileOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="btn-ghost text-sm">Log in</Link>
                                <Link to="/register" className="btn-primary text-sm !py-2 !px-4">Sign up</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile nav */}
                {mobileOpen && isAuthenticated && (
                    <div className="md:hidden py-3 border-t border-gray-100 animate-slide-down">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`block px-4 py-2.5 rounded-lg font-medium transition-colors ${isActive(link.path) ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
