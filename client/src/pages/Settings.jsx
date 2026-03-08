import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineLockClosed, HiOutlineLogout, HiOutlineBell } from 'react-icons/hi';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { updateSettings } from '../api/users';
import Modal from '../components/Modal';

const Settings = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [radius, setRadius] = useState(user?.notificationRadius || 10000);
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [saving, setSaving] = useState(false);
    const [logoutModal, setLogoutModal] = useState(false);

    const handleSaveRadius = async () => {
        try {
            setSaving(true);
            await updateSettings({ notificationRadius: radius });
            toast.success('Settings saved');
        } catch { toast.error('Failed'); }
        finally { setSaving(false); }
    };

    const handleChangePwd = async () => {
        if (!currentPwd || !newPwd || newPwd.length < 6) { toast.error('Password must be 6+ chars'); return; }
        try {
            setSaving(true);
            await updateSettings({ currentPassword: currentPwd, newPassword: newPwd });
            toast.success('Password changed');
            setCurrentPwd(''); setNewPwd('');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setSaving(false); }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="page-container max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
            <div className="space-y-6">
                {/* Profile card */}
                <div className="card-static p-6 flex items-center gap-4">
                    {user?.profileImage ? <img src={user.profileImage} alt="" className="w-14 h-14 rounded-full object-cover" /> : <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xl">{user?.fullName?.charAt(0)}</div>}
                    <div>
                        <h3 className="font-semibold text-gray-900">{user?.fullName}</h3>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
                    </div>
                </div>
                {/* Notification radius */}
                {user?.role === 'receiver' && (
                    <div className="card-static p-6">
                        <div className="flex items-center gap-3 mb-4"><HiOutlineBell className="w-5 h-5 text-primary-500" /><h2 className="font-semibold text-gray-900">Notification Radius</h2></div>
                        <p className="text-sm text-gray-500 mb-4">Set how far away donations should be to trigger notifications.</p>
                        <div className="flex items-center gap-4">
                            <input type="range" min={1000} max={50000} step={1000} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="flex-1 accent-primary-500" />
                            <span className="text-sm font-medium w-16 text-right">{(radius / 1000).toFixed(0)} km</span>
                        </div>
                        <button onClick={handleSaveRadius} disabled={saving} className="btn-primary mt-4 text-sm">{saving ? 'Saving...' : 'Save'}</button>
                    </div>
                )}
                {/* Change password */}
                <div className="card-static p-6">
                    <div className="flex items-center gap-3 mb-4"><HiOutlineLockClosed className="w-5 h-5 text-primary-500" /><h2 className="font-semibold text-gray-900">Change Password</h2></div>
                    <div className="space-y-3">
                        <input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} placeholder="Current password" className="input-field" />
                        <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="New password (min 6 chars)" className="input-field" />
                        <button onClick={handleChangePwd} disabled={saving} className="btn-primary text-sm">{saving ? 'Changing...' : 'Change Password'}</button>
                    </div>
                </div>
                {/* Logout */}
                <button onClick={() => setLogoutModal(true)} className="w-full card-static p-4 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors">
                    <HiOutlineLogout className="w-5 h-5" /> <span className="font-medium">Log out</span>
                </button>
            </div>
            <Modal isOpen={logoutModal} onClose={() => setLogoutModal(false)} onConfirm={handleLogout} title="Log out?" message="You'll need to log in again to access your account." confirmText="Log out" variant="warning" />
        </div>
    );
};

export default Settings;
