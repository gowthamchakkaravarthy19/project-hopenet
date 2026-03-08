import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProfileGate = ({ children }) => {
    const { user } = useAuthStore();

    if (user && !user.isProfileComplete) {
        return <Navigate to="/complete-profile" replace />;
    }

    return children;
};

export default ProfileGate;
