import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getPost, updatePost } from '../api/posts';
import ImageUploader from '../components/ImageUploader';
import LocationPicker from '../components/LocationPicker';

const categories = [
    { value: 'food', label: 'Food', emoji: '🍽️' },
    { value: 'clothing', label: 'Clothing', emoji: '👕' },
    { value: 'groceries', label: 'Groceries', emoji: '🛒' },
    { value: 'medicine', label: 'Medicine', emoji: '💊' },
    { value: 'other', label: 'Other', emoji: '📦' },
];

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
    const selCat = watch('category');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await getPost(id);
                const p = res.data.post;
                setValue('title', p.title);
                setValue('description', p.description);
                setValue('category', p.category);
                setValue('contactNumber', p.contactNumber);
                setAddress(p.address || '');
                if (p.location?.coordinates) {
                    setLocation({ latitude: p.location.coordinates[1], longitude: p.location.coordinates[0] });
                }
                if (p.images?.length) setImages(p.images);
            } catch { toast.error('Failed to load post'); navigate('/dashboard'); }
            finally { setFetching(false); }
        };
        fetchPost();
    }, [id]);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const fd = new FormData();
            Object.entries(data).forEach(([k, v]) => { if (v) fd.append(k, v); });
            if (location) { fd.append('latitude', location.latitude); fd.append('longitude', location.longitude); }
            fd.append('address', address);
            const newImgs = images.filter((img) => typeof img !== 'string');
            newImgs.forEach((img) => fd.append('images', img));
            await updatePost(id, fd);
            toast.success('Post updated!');
            navigate('/dashboard');
        } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
        finally { setLoading(false); }
    };

    if (fetching) return <div className="page-container flex justify-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="page-container max-w-3xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Post</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="card-static p-6 space-y-5">
                    <div><label className="label">Title</label><input {...register('title')} className="input-field" /></div>
                    <div><label className="label">Description</label><textarea {...register('description')} rows={4} className="input-field resize-none" /></div>
                    <div>
                        <label className="label">Category</label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {categories.map((c) => (
                                <button key={c.value} type="button" onClick={() => setValue('category', c.value)}
                                    className={`p-3 rounded-xl border-2 text-center transition-all ${selCat === c.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                                    <span className="text-xl">{c.emoji}</span><p className="text-xs font-medium mt-1">{c.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div><label className="label">Contact Number</label><input {...register('contactNumber')} className="input-field" /></div>
                </div>
                <div className="card-static p-6 space-y-4"><h2 className="text-lg font-semibold">Images</h2><ImageUploader images={images} setImages={setImages} /></div>
                <div className="card-static p-6 space-y-4"><h2 className="text-lg font-semibold">Location</h2><LocationPicker location={location} setLocation={setLocation} address={address} setAddress={setAddress} /></div>
                <div className="flex gap-3 justify-end">
                    <button type="button" onClick={() => navigate(-1)} className="btn-ghost">Cancel</button>
                    <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPost;
