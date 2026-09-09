import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Mountain, AlertTriangle, Loader2, CheckCircle, MessageCircle, ShieldCheck, Users, ArrowRight } from 'lucide-react';
import { eventsApi } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../components/ui/Toast';
import { BackButton } from '../components/ui/BackButton';
import { ReadingProgressBar } from '../components/ui/ReadingProgressBar';
import { EventDetailSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';

export const EventDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [registering, setRegistering] = useState(false);
    const { user, isLoggedIn } = useAuthStore();
    const { showToast, ToastComponent } = useToast();

    useEffect(() => {
        const fetchEvent = async () => {
            if (!id) return;
            try {
                const data = await eventsApi.get(id);
                setEvent(data.event);
            } catch (err: any) {
                console.error('Failed to load event:', err);
                setError(err.message || 'Expedition briefing could not be retrieved.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleRegister = async () => {
        if (!isLoggedIn) {
            showToast('Please log in to register.', 'error');
            return;
        }
        setRegistering(true);
        try {
            const data = await eventsApi.register(event._id);
            setEvent(data.event);
            showToast('Deployment confirmed! Check your email.', 'success');
        } catch (err: any) {
            showToast(err.message || 'Registration failed.', 'error');
        } finally {
            setRegistering(false);
        }
    };

    const isRegistered = event?.participants?.some((p: any) => (typeof p === 'string' ? p : p._id) === user?.id);

    if (loading) {
        return <EventDetailSkeleton />;
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white pt-24">
                <div className="max-w-md w-full">
                    <ErrorState
                        statusCode={error ? 500 : 404}
                        title={error ? "Briefing Signal Lost" : "Expedition Not Found"}
                        message={error || 'This alpine expedition has concluded or is not listed in active rosters.'}
                        backLink="/events"
                        backText="Back to Roster"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            <ReadingProgressBar />
            {ToastComponent}
            
            {/* Hero Section */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <img 
                    src={event.image} 
                    className="w-full h-full object-cover filter brightness-[0.3] scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                
                <div className="absolute top-32 left-0 right-0 px-6 md:px-12 z-50">
                    <div className="max-w-7xl mx-auto">
                        <BackButton backTo="/events" />
                    </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pt-20 px-6">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-alpine-sunrise/20 border border-alpine-sunrise/40 text-alpine-sunrise text-xs font-bold uppercase tracking-[0.2em] mb-6">
                            Expedition Briefing
                        </span>
                        <h1 className="text-5xl md:text-8xl font-serif font-black text-white mb-8 drop-shadow-2xl">
                            {event.title}
                        </h1>
                        <div className="flex flex-wrap justify-center gap-8 text-white/60">
                            <div className="flex items-center gap-2">
                                <Calendar size={20} className="text-alpine-sunrise" />
                                <span className="font-bold tracking-wider">{event.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={20} className="text-alpine-glacier" />
                                <span className="font-bold tracking-wider">{event.location}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-12">
                        <div className="bg-[#11141A] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                            <h2 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3">
                                <ShieldCheck className="text-alpine-glacier" /> Mission Objectives
                            </h2>
                            <div className="prose prose-invert max-w-none text-white/70 text-lg leading-relaxed">
                                {event.description || "The mission objectives for this expedition are currently being finalized by the lead guides. Please check back shortly for technical requirements and gear lists."}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/5">
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                    <Mountain className="text-alpine-sunrise mb-4" size={24} />
                                    <h4 className="text-xs uppercase tracking-widest text-white/40 mb-1">Difficulty</h4>
                                    <p className="font-bold text-xl">{event.difficulty}</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                    <Clock className="text-alpine-glacier mb-4" size={24} />
                                    <h4 className="text-xs uppercase tracking-widest text-white/40 mb-1">Departure</h4>
                                    <p className="font-bold text-xl">{event.time}</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                    <Users className="text-emerald-400 mb-4" size={24} />
                                    <h4 className="text-xs uppercase tracking-widest text-white/40 mb-1">Slots Left</h4>
                                    <p className="font-bold text-xl">{event.slotsLeft ?? (event.totalSlots - (event.participants?.length || 0))}</p>
                                </div>
                            </div>
                        </div>

                        {/* Requirements Card */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-12">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <AlertTriangle className="text-amber-500" /> Technical Requirements
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex gap-4 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-alpine-glacier mt-2.5 shrink-0" />
                                    <p className="text-white/60">Verified mountaineering insurance required for all participants.</p>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-alpine-glacier mt-2.5 shrink-0" />
                                    <p className="text-white/60">Full technical gear check at basecamp 24h prior to departure.</p>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-alpine-glacier mt-2.5 shrink-0" />
                                    <p className="text-white/60">Physical fitness assessment required for Grade III routes and above.</p>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Sidebar: Registration */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-32 space-y-6">
                            <div className="bg-alpine-glacier/10 border border-alpine-glacier/30 rounded-[2.5rem] p-8 backdrop-blur-xl">
                                <h3 className="text-2xl font-serif font-bold mb-6">Status: {isRegistered ? 'Deployed' : 'Open'}</h3>
                                {isRegistered ? (
                                    <div className="space-y-6">
                                        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-3">
                                            <CheckCircle size={20} />
                                            <span className="font-bold">Your slot is secured.</span>
                                        </div>
                                        {event.whatsappGroupUrl && (
                                            <a 
                                                href={event.whatsappGroupUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-4 rounded-2xl bg-[#25D366] text-white font-black text-center flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
                                            >
                                                <MessageCircle size={24} /> JOIN EXPEDITION CHAT
                                            </a>
                                        )}
                                        <p className="text-xs text-white/40 text-center">Registration details and gear list sent to {user?.email}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <p className="text-white/60 text-sm leading-relaxed">
                                            Apply for the roster to secure your place. Final approval is subject to technical gear check and verification by the lead guides.
                                        </p>
                                        <button 
                                            onClick={handleRegister}
                                            disabled={registering}
                                            className="w-full py-5 rounded-2xl bg-alpine-sunrise text-white font-black text-xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(226,160,113,0.3)]"
                                        >
                                            {registering ? <Loader2 className="animate-spin" size={24} /> : "APPLY NOW"}
                                        </button>
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest text-center">Secure SSL Transmission Active</p>
                                    </div>
                                )}
                            </div>

                            {event.ticketUrl && (
                                <a 
                                    href={event.ticketUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-4 hover:bg-white/10 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-full bg-alpine-sunrise flex items-center justify-center">
                                        <ArrowRight size={20} className="text-white -rotate-45" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-lg text-alpine-sunrise">External Tickets</p>
                                        <p className="text-xs text-white/40 mt-1">Get your tickets here</p>
                                    </div>
                                </a>
                            )}

                            {/* Organizer Info */}
                            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-alpine-navy flex items-center justify-center border border-white/10">
                                    <Mountain size={20} className="text-white/50" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-white/40">Organized By</p>
                                    <p className="font-bold">Mountaineer Mallu HQ</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
