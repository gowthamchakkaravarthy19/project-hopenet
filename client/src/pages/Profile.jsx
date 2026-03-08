import { useState } from 'react';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineCalendar } from 'react-icons/hi';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { updateProfile } from '../api/users';
import ImageUploader from '../components/ImageUploader';

const Profile = () => {
    const { user, setUser } = useAuthStore();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [mobile, setMobile] = useState(user?.mobile || '');
    const [address, setAddress] = useState(user?.address || '');
    const [images, setImages] = useState([]);

    const handleSave = async () => {
        try {
            setLoading(true);
            const fd = new FormData();
            fd.append('fullName', fullName);
            fd.append('mobile', mobile);
            fd.append('address', address);
            if (images[0] && typeof images[0] !== 'string') fd.append('profileImage', images[0]);
            const res = await updateProfile(fd);
            setUser(res.data.user);
            setEditing(false);
            toast.success('Profile updated!');
        } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="page-container max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
            <div className="card-static p-6">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-8">
                    {editing ? (
                        <div className="w-full max-w-xs"><ImageUploader images={images} setImages={setImages} maxImages={1} /></div>
                    ) : (
                        <>
                            {user?.profileImage ? (
                                <img src={user.profileImage} alt="" className="w-24 h-24 rounded-full object-cover mb-3 ring-4 ring-primary-100" />
                            ) : (
                                <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-3xl font-bold mb-3">{user?.fullName?.charAt(0)}</div>
                            )}
                            <h2 className="text-xl font-bold text-gray-900">{user?.fullName}</h2>
                            <span className="px-3 py-1 mt-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-full capitalize">{user?.role}</span>
                        </>
                    )}
                </div>
                {/* Info */}
                <div className="space-y-4">
                    <div>
                        <label className="label flex items-center gap-2"><HiOutlineUser className="w-4 h-4" /> Full Name</label>
                        {editing ? <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" /> : <p className="text-gray-700">{user?.fullName}</p>}
                    </div>
                    <div>
                        <label className="label flex items-center gap-2"><HiOutlineMail className="w-4 h-4" /> Email</label>
                        <p className="text-gray-700">{user?.email}</p>
                    </div>
                    <div>
                        <label className="label flex items-center gap-2"><HiOutlinePhone className="w-4 h-4" /> Mobile</label>
                        {editing ? <input value={mobile} onChange={(e) => setMobile(e.target.value)} className="input-field" /> : <p className="text-gray-700">{user?.mobile}</p>}
                    </div>
                    <div>
                        <label className="label flex items-center gap-2"><HiOutlineLocationMarker className="w-4 h-4" /> Address</label>
                        {editing ? <input value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" /> : <p className="text-gray-700">{user?.address || 'Not set'}</p>}
                    </div>
                    <div>
                        <label className="label flex items-center gap-2"><HiOutlineCalendar className="w-4 h-4" /> Date of Birth</label>
                        <p className="text-gray-700">{user?.dob ? new Date(user.dob).toLocaleDateString() : 'Not set'}</p>
                    </div>
                </div>
                <div className="flex gap-3 mt-8">
                    {editing ? (
                        <>
                            <button onClick={() => setEditing(false)} className="btn-ghost flex-1">Cancel</button>
                            <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Save'}</button>
                        </>
                    ) : (
                        <button onClick={() => setEditing(true)} className="btn-primary w-full">Edit Profile</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
