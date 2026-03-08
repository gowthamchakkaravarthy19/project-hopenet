import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const schema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    mobile: z.string().min(10, 'Valid mobile number required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['donor', 'receiver'], { required_error: 'Select a role' }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

const Register = () => {
    const { register: registerUser } = useAuthStore();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { role: 'donor' },
    });
    const selectedRole = watch('role');

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            await registerUser({
                fullName: data.fullName,
                email: data.email,
                mobile: data.mobile,
                password: data.password,
                role: data.role,
            });
            toast.success('Registration successful!');
            navigate('/complete-profile');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent-600 via-accent-500 to-accent-400 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10 flex flex-col justify-center px-12 lg:px-20 text-white">
                    <div className="flex items-center gap-2 mb-8">
                        <img src="/hopenet-logo.png" alt="HopeNet" className="h-12 w-auto object-contain drop-shadow-lg bg-white p-1.5 rounded-2xl" />
                        <span className="text-xl font-bold">HopeNet</span>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
                        Join our growing community
                    </h2>
                    <p className="text-white/70 text-lg">
                        Whether you're sharing surplus or serving the community, you belong here.
                    </p>
                </div>
            </div>

            {/* Right panel - Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <img src="/hopenet-logo.png" alt="HopeNet" className="h-10 w-auto object-contain drop-shadow-md" />
                        <span className="text-xl font-bold"><span className="text-[#152b4b]">Hope</span><span className="text-[#c8822a]">Net</span></span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-500 mb-8">Start making a difference in your community.</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Role toggle */}
                        <div>
                            <label className="label">I am a...</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: 'donor', label: 'Donor', desc: 'I want to donate', emoji: '🎁' },
                                    { value: 'receiver', label: 'Receiver', desc: 'I represent an NGO', emoji: '🏛️' },
                                ].map((r) => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => setValue('role', r.value)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${selectedRole === r.value
                                            ? 'border-primary-500 bg-primary-50 shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="text-2xl">{r.emoji}</span>
                                        <p className="font-semibold text-gray-900 mt-1">{r.label}</p>
                                        <p className="text-xs text-gray-500">{r.desc}</p>
                                    </button>
                                ))}
                            </div>
                            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
                        </div>

                        <div>
                            <label className="label">Full Name</label>
                            <div className="relative">
                                <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input {...register('fullName')} placeholder="John Doe" className="input-field !pl-11" />
                            </div>
                            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                        </div>

                        <div>
                            <label className="label">Email</label>
                            <div className="relative">
                                <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input {...register('email')} type="email" placeholder="you@example.com" className="input-field !pl-11" />
                            </div>
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="label">Mobile Number</label>
                            <div className="relative">
                                <HiOutlinePhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input {...register('mobile')} placeholder="+91 98765 43210" className="input-field !pl-11" />
                            </div>
                            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="label">Password</label>
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        {...register('password')}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••"
                                        className="input-field !pl-11"
                                    />
                                </div>
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                            </div>
                            <div>
                                <label className="label">Confirm</label>
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        {...register('confirmPassword')}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••"
                                        className="input-field !pl-11"
                                    />
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="showPwd" onChange={() => setShowPassword(!showPassword)} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                            <label htmlFor="showPwd" className="text-sm text-gray-500">Show passwords</label>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 text-base disabled:opacity-60">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating account...
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
