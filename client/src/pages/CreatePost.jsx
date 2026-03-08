import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { createPost } from '../api/posts';
import ImageUploader from '../components/ImageUploader';
import LocationPicker from '../components/LocationPicker';

const schema = z.object({
    title: z.string().min(3, 'Title required'),
    description: z.string().min(10, 'Description must be 10+ chars'),
    category: z.enum(['food', 'clothing', 'groceries', 'medicine', 'other']),
    contactNumber: z.string().min(10, 'Valid number required'),
    expiresIn: z.string().min(1, 'Select window'),
});

const categories = [
    { value: 'food', label: 'Food', emoji: '🍽️' },
    { value: 'clothing', label: 'Clothing', emoji: '👕' },
    { value: 'groceries', label: 'Groceries', emoji: '🛒' },
    { value: 'medicine', label: 'Medicine', emoji: '💊' },
    { value: 'other', label: 'Other', emoji: '📦' },
];

const expiryOpts = [
    { value: '1', label: '1 hour' }, { value: '2', label: '2 hours' },
    { value: '3', label: '3 hours' }, { value: '6', label: '6 hours' },
    { value: '12', label: '12 hours' }, { value: '24', label: '1 day' },
    { value: '48', label: '2 days' }, { value: '72', label: '3 days' },
];

const CreatePost = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { contactNumber: user?.mobile || '', category: 'food', expiresIn: '3' },
    });
    const selCat = watch('category');

    const onSubmit = async (data) => {
        if (!location) { toast.error('Set your location'); return; }
        try {
            setLoading(true);
            const fd = new FormData();
            Object.entries(data).forEach(([k, v]) => fd.append(k, v));
            fd.append('latitude', location.latitude);
            fd.append('longitude', location.longitude);
            fd.append('address', address);
            images.forEach((img) => fd.append('images', img));
            await createPost(fd);
            toast.success('Post created! Nearby receivers notified.');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="page-container max-w-3xl">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Donation Post</h1>
                <p className="text-gray-500 mt-1">Share your surplus with nearby organizations.</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="card-static p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">Details</h2>
                    <div>
                        <label className="label">Title</label>
                        <input {...register('title')} placeholder='e.g. "Wedding Feast Leftovers"' className="input-field" />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                    </div>
                    <div>
                        <label className="label">Description</label>
                        <textarea {...register('description')} rows={4} placeholder="Describe quantity, type, condition..." className="input-field resize-none" />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                    </div>
                    <div>
                        <label className="label">Category</label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {categories.map((c) => (
                                <button key={c.value} type="button" onClick={() => setValue('category', c.value)}
                                    className={`p-3 rounded-xl border-2 text-center transition-all ${selCat === c.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <span className="text-xl">{c.emoji}</span>
                                    <p className="text-xs font-medium mt-1 text-gray-700">{c.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Contact Number</label>
                            <input {...register('contactNumber')} className="input-field" />
                            {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber.message}</p>}
                        </div>
                        <div>
                            <label className="label">Available for</label>
                            <select {...register('expiresIn')} className="input-field">
                                {expiryOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="card-static p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Images</h2>
                    <ImageUploader images={images} setImages={setImages} />
                </div>
                <div className="card-static p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Location</h2>
                    <LocationPicker location={location} setLocation={setLocation} address={address} setAddress={setAddress} />
                </div>
                <div className="flex gap-3 justify-end">
                    <button type="button" onClick={() => navigate(-1)} className="btn-ghost">Cancel</button>
                    <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
                        {loading ? <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</span> : 'Create Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;
