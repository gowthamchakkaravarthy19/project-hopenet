import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileGate from './components/ProfileGate';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CompleteProfile from './pages/CompleteProfile';
import DonorDashboard from './pages/DonorDashboard';
import DonorRequests from './pages/DonorRequests';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import PostDetail from './pages/PostDetail';
import ReceiverFeed from './pages/ReceiverFeed';
import MapPage from './pages/MapPage';
import ClaimedItems from './pages/ClaimedItems';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

const App = () => {
    const { checkAuth, isAuthenticated, user, isLoading } = useAuthStore();

    useEffect(() => { checkAuth(); }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading HopeNet...</p>
                </div>
            </div>
        );
    }

    const showNavbar = isAuthenticated;

    return (
        <div className="min-h-screen bg-gray-50">
            {showNavbar && <Navbar />}
            <Routes>
                {/* Public routes */}
                <Route path="/" element={isAuthenticated ? <Navigate to={user?.role === 'donor' ? '/dashboard' : '/feed'} /> : <Landing />} />
                <Route path="/login" element={isAuthenticated ? <Navigate to={user?.role === 'donor' ? '/dashboard' : '/feed'} /> : <Login />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to={user?.role === 'donor' ? '/dashboard' : '/feed'} /> : <Register />} />

                {/* Protected: Profile completion */}
                <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />

                {/* Donor routes */}
                <Route path="/dashboard" element={<ProtectedRoute><ProfileGate><DonorDashboard /></ProfileGate></ProtectedRoute>} />
                <Route path="/requests" element={<ProtectedRoute><ProfileGate><DonorRequests /></ProfileGate></ProtectedRoute>} />
                <Route path="/create-post" element={<ProtectedRoute><ProfileGate><CreatePost /></ProfileGate></ProtectedRoute>} />
                <Route path="/post/:id/edit" element={<ProtectedRoute><ProfileGate><EditPost /></ProfileGate></ProtectedRoute>} />

                {/* Receiver routes */}
                <Route path="/feed" element={<ProtectedRoute><ProfileGate><ReceiverFeed /></ProfileGate></ProtectedRoute>} />
                <Route path="/map" element={<ProtectedRoute><ProfileGate><MapPage /></ProfileGate></ProtectedRoute>} />
                <Route path="/claims" element={<ProtectedRoute><ProfileGate><ClaimedItems /></ProfileGate></ProtectedRoute>} />

                {/* Shared routes */}
                <Route path="/post/:id" element={<ProtectedRoute><ProfileGate><PostDetail /></ProfileGate></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><ProfileGate><Notifications /></ProfileGate></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfileGate><Profile /></ProfileGate></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><ProfileGate><Settings /></ProfileGate></ProtectedRoute>} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
};

export default App;
