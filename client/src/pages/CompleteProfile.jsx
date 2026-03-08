import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlinePhotograph } from 'react-icons/hi';
import useAuthStore from '../store/authStore';
import { completeProfile } from '../api/users';
import ImageUploader from '../components/ImageUploader';

const CompleteProfile = () => {
    const { user, setUser } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [dob, setDob] = useState('');
    const [address, setAddress] = useState('');
    const [images, setImages] = useState([]);

    const progress = [dob, address].filter(Boolean).length;
    const progressPercent = (progress / 2) * 100;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!dob || !address) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('dob', dob);
            formData.append('address', address);
            if (images[0]) formData.append('profileImage', images[0]);

            // Try to get current location
            if (navigator.geolocation) {
                try {
                    const pos = await new Promise((resolve, reject) =>
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
                    );
                    formData.append('latitude', pos.coords.latitude);
                    formData.append('longitude', pos.coords.longitude);
                } catch {
                    // Location is optional
                }
            }

            const res = await completeProfile(formData);
            setUser(res.data.user);
            toast.success('Profile complete! Welcome to HopeNet');
            navigate(user?.role === 'donor' ? '/dashboard' : '/feed');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to complete profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <div className="card-static p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">👋</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
                        <p className="text-gray-500 mt-2">Just a couple more things before you get started.</p>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-500">Profile completion</span>
                            <span className="font-semibold text-primary-600">{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="label flex items-center gap-2">
                                <HiOutlineCalendar className="w-4 h-4 text-primary-500" />
                                Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="input-field"
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div>
                            <label className="label flex items-center gap-2">
                                <HiOutlineLocationMarker className="w-4 h-4 text-primary-500" />
                                Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Enter your full address"
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="label flex items-center gap-2">
                                <HiOutlinePhotograph className="w-4 h-4 text-primary-500" />
                                Profile Photo <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <ImageUploader images={images} setImages={setImages} maxImages={1} />
                        </div>

                        <button type="submit" disabled={loading || !dob || !address} className="btn-primary w-full !py-3.5 text-base disabled:opacity-60">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </span>
                            ) : 'Complete Profile'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfile;
