import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineHeart, HiOutlineLocationMarker, HiOutlineLightningBolt, HiOutlineUserGroup, HiOutlineGlobe, HiOutlineShieldCheck } from 'react-icons/hi';
import { getPublicStats } from '../api/posts';

const Landing = () => {
    const [stats, setStats] = useState({ totalDonations: 0, activePosts: 0, ngosRegistered: 0 });

    useEffect(() => {
        getPublicStats().then((res) => setStats(res.data)).catch(() => { });
    }, []);

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-b from-primary-900 via-primary-700 to-primary-400 text-white pb-0">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent-500 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 pb-28 lg:pb-36">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-sm text-sm font-medium mb-8 animate-fade-in max-w-[260px] sm:max-w-none text-center leading-snug">
                            <HiOutlineHeart className="w-4 h-4 flex-shrink-0" />
                            Connecting communities, one donation at a time
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-slide-up">
                            Turn your surplus into{' '}
                            <span className="relative">
                                <span className="relative z-10">someone's blessing</span>
                                <span className="absolute bottom-2 left-0 w-full h-3 bg-accent-500/40 rounded-full" />
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
                            HopeNet connects people with surplus food and goods to nearby NGOs, orphanages, and charitable trusts — instantly, via GPS.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
                            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-white text-primary-700 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                I want to Donate
                            </Link>
                            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-accent-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-accent-500/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                I represent an NGO
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 lg:py-28 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Simple, fast, and impactful. Connect in three easy steps.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
                        {/* Donor Steps */}
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <span className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-bold">D</span>
                                <h3 className="text-xl font-bold text-gray-900">For Donors</h3>
                            </div>
                            <div className="space-y-6">
                                {[
                                    { step: '1', icon: <HiOutlineLightningBolt className="w-6 h-6" />, title: 'Post your surplus', desc: 'Upload images, set category, and share your location' },
                                    { step: '2', icon: <HiOutlineLocationMarker className="w-6 h-6" />, title: 'We find nearby NGOs', desc: 'GPS matching instantly notifies receivers within your area' },
                                    { step: '3', icon: <HiOutlineHeart className="w-6 h-6" />, title: 'Make an impact', desc: 'Track your donations and see the lives you\'ve touched' },
                                ].map((item) => (
                                    <div key={item.step} className="flex gap-4 items-start group">
                                        <div className="flex-shrink-0 w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                                            <p className="text-sm text-gray-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Receiver Steps */}
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <span className="w-10 h-10 bg-accent-100 text-accent-600 rounded-xl flex items-center justify-center font-bold">R</span>
                                <h3 className="text-xl font-bold text-gray-900">For Receivers</h3>
                            </div>
                            <div className="space-y-6">
                                {[
                                    { step: '1', icon: <HiOutlineGlobe className="w-6 h-6" />, title: 'Browse nearby donations', desc: 'See available donations within your radius on a live map' },
                                    { step: '2', icon: <HiOutlineShieldCheck className="w-6 h-6" />, title: 'Claim what you need', desc: 'One tap to claim — the donor is instantly notified' },
                                    { step: '3', icon: <HiOutlineUserGroup className="w-6 h-6" />, title: 'Collect & distribute', desc: 'Get directions and pick up donations for your community' },
                                ].map((item) => (
                                    <div key={item.step} className="flex gap-4 items-start group">
                                        <div className="flex-shrink-0 w-12 h-12 bg-accent-50 text-accent-600 rounded-xl flex items-center justify-center group-hover:bg-accent-500 group-hover:text-white transition-colors duration-300">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                                            <p className="text-sm text-gray-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Live Stats */}
            <section className="py-16 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {[
                            { label: 'Total Donations', value: stats.totalDonations, icon: '🎁' },
                            { label: 'Active Right Now', value: stats.activePosts, icon: '🔥' },
                            { label: 'NGOs Registered', value: stats.ngosRegistered, icon: '🏛️' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-primary-50 transition-colors duration-300">
                                <div className="text-3xl mb-2">{stat.icon}</div>
                                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{stat.value.toLocaleString()}</div>
                                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">What People Say</h2>
                    <p className="text-center text-gray-500">Real stories from our community</p>
                    <div className="grid md:grid-cols-3 gap-6 mt-12">
                        {[
                            { name: 'Thirumal D', role: 'Donor', text: 'After every family celebration, we used to throw away so much food. HopeNet helped us donate it to a nearby orphanage in just 30 minutes!', avatar: 'TD' },
                            { name: 'Goutham C', role: 'NGO Director', text: 'As an NGO serving 200+ daily meals, HopeNet has been a game-changer. We get real-time alerts for nearby donations and never miss an opportunity.', avatar: 'GC' },
                            { name: 'Arun M', role: 'Donor', text: 'The map feature is brilliant. I could see exactly which organizations were nearby and track my contribution. Makes giving so easy and transparent.', avatar: 'AM' },
                        ].map((t) => (
                            <div key={t.name} className="card-static p-6">
                                <div className="flex items-center gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((s) => <span key={s} className="text-amber-400">★</span>)}
                                </div>
                                <p className="text-gray-600 mb-6 leading-relaxed">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                                        <p className="text-xs text-gray-500">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-500 text-white">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to make a difference?</h2>
                    <p className="text-white/80 mb-8">Join thousands of donors and NGOs already using HopeNet.</p>
                    <Link to="/register" className="inline-block px-8 py-4 bg-white text-primary-700 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        Get Started — It's Free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <img src="/hopenet-logo.png" alt="HopeNet" className="h-8 w-auto object-contain bg-white rounded-md" />
                            <span className="font-bold text-white">HopeNet</span>
                        </div>
                        {/*<div className="flex gap-6 text-sm">
                            <a href="#" className="hover:text-white transition-colors">About</a>
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Contact</a>
                        </div>*/}
                        <p className="text-sm text-white text-center">© 2026 Thirumal Dhakshnamoorthy. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
