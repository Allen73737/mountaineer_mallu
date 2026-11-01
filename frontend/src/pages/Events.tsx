import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowRight, Mountain, AlertTriangle, CheckCircle, MessageCircle } from 'lucide-react';
import { Loader2 } from '../components/ui/BrandLoader';
import { Link } from 'react-router-dom';
import { eventsApi } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { EventSkeleton, ImageWithSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { BackButton } from '../components/ui/BackButton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { CreditTitle } from '../components/ui/CreditTitle';
import { MorphLink } from '../components/ui/MorphLink';

export const EventsPage = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [registeringId, setRegisteringId] = useState<string | null>(null);
    const { user, isLoggedIn } = useAuthStore();
    const { showToast, ToastComponent } = useToast();

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await eventsApi.list(1, 20);
            setEvents(data.events || []);
        } catch (err: any) {
            console.error('Failed to load events:', err);
            setError(err.message || 'Failed to retrieve upcoming expedition rosters.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleRegister = async (eventId: string) => {
        if (!isLoggedIn) {
            showToast('Please log in to register for events.', 'error');
            return;
        }
        setRegisteringId(eventId);
        try {
            const data = await eventsApi.register(eventId);
            setEvents(events.map(e => e._id === eventId ? data.event : e));
            showToast('Registered successfully! Check your email for confirmation.', 'success');
        } catch (err: any) {
            showToast(err.message || 'Registration failed.', 'error');
        } finally {
            setRegisteringId(null);
        }
    };

    const handleUnregister = async (eventId: string) => {
        setRegisteringId(eventId);
        try {
            const data = await eventsApi.unregister(eventId);
            setEvents(events.map(e => e._id === eventId ? data.event : e));
            showToast('Unregistered from event.', 'info');
        } catch (err: any) {
            showToast(err.message || 'Failed to unregister.', 'error');
        } finally {
            setRegisteringId(null);
        }
    };

    const isRegistered = (evt: any) => {
        if (!user) return false;
        return evt.participants?.some((p: any) => (typeof p === 'string' ? p : p._id) === user.id);
    };

    return (
        <div className="min-h-screen bg-alpine-snow dark:bg-black text-alpine-navy dark:text-alpine-snow pt-32 pb-24 px-6 md:px-12 relative overflow-hidden">
            {ToastComponent}

            {/* Absolute massive geometric line art background */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                    <path d="M0,100 L50,0 L100,100 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    <path d="M25,100 L50,50 L75,100 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto relative z-50">
                <BackButton />

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, type: "spring", damping: 15 }}
                    className="mb-24 text-center max-w-4xl mx-auto"
                >
                    <CreditTitle lines={['Upcoming', 'Trips']} align="center" creditClassName="text-[#9A5E43] dark:text-alpine-sunrise" className="text-6xl md:text-8xl font-serif font-normal text-alpine-navy dark:text-alpine-snow leading-none" />
                    <p className="text-xl md:text-2xl font-light text-alpine-navy/60 dark:text-alpine-snow/60">
                        Secure your place on the rope. Filter by difficulty, region, and technical requirements.
                    </p>
                </motion.div>

                {/* Loading */}
                {loading ? (
                    <div className="space-y-24 pl-8 md:pl-16">
                        {[1, 2, 3].map(i => <EventSkeleton key={i} />)}
                    </div>
                ) : error ? (
                    <ErrorState
                        title="We couldn't load trips right now"
                        message={error}
                        onRetry={fetchEvents}
                    />
                ) : events.length === 0 ? (
                    <EmptyState
                        icon={Mountain}
                        title="No Expeditions Scheduled Yet"
                        description="All current summit tracks are resting between seasons. New alpine ascents, gear training sessions, and gatherings are scheduled regularly."
                        actionText="Return to Basecamp"
                        actionLink="/"
                    />
                ) : (
                    /* Timeline Layout */
                    <div className="relative border-l border-alpine-navy/10 dark:border-alpine-snow/10 pl-8 md:pl-16 space-y-24">
                        {events.map((evt, i) => (
                            <motion.div
                                key={evt._id || i}
                                initial={{ opacity: 0, x: 100 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, type: "spring", damping: 15 }}
                                className="relative group"
                            >
                                {/* Timeline marker node */}
                                <div className="absolute -left-[37px] md:-left-[69px] w-6 h-6 rounded-full bg-alpine-blue dark:bg-alpine-sunrise border-4 border-alpine-snow dark:border-alpine-navy z-10 group-hover:scale-150 transition-transform duration-500 shadow-xl" />

                                <div data-morph-card className="flex flex-col xl:flex-row gap-12 bg-white/50 dark:bg-black/30 glass-dark rounded-3xl p-6 md:p-10 border border-black/5 dark:border-white/10 hover:bg-white/80 dark:hover:bg-black/50 transition-colors shadow-2xl">

                                    {/* Image */}
                                    <div className="reveal-img [--rev-radius:1rem] w-full xl:w-2/5 aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden relative">
                                        <ImageWithSkeleton
                                            src={evt.image}
                                            alt={evt.title}
                                            containerClassName="w-full h-full"
                                            className="w-full h-full object-cover filter brightness-75 group-hover:brightness-100 group-hover:scale-110 transition-transform duration-[2000ms]"
                                        />
                                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-widest border border-white/20">
                                            {evt.type}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="w-full xl:w-3/5 flex flex-col justify-center">
                                        <div className="flex flex-wrap items-center gap-6 mb-6 text-sm font-semibold tracking-wider text-alpine-navy/80 dark:text-alpine-snow/80 uppercase">
                                            <span className="flex items-center gap-2"><Calendar size={18} className="text-alpine-blue dark:text-alpine-sunrise" /> {evt.date}</span>
                                            <span className="flex items-center gap-2"><Clock size={18} className="text-alpine-blue dark:text-alpine-sunrise" /> {evt.time}</span>
                                            <span className="flex items-center gap-2"><MapPin size={18} className="text-alpine-forest dark:text-alpine-glacier" /> {evt.location}</span>
                                        </div>

                                        <h2 className="text-4xl md:text-5xl font-serif text-alpine-navy dark:text-alpine-snow mb-6 drop-shadow-sm">{evt.title}</h2>

                                        <div className="flex items-center gap-8 mb-10">
                                            <div className="flex items-center gap-2 text-alpine-navy/60 dark:text-alpine-snow/60">
                                                <Mountain size={20} className={evt.difficulty === 'Expert' ? 'text-red-500' : 'text-alpine-navy/40 dark:text-alpine-snow/40'} />
                                                <span className="font-medium text-lg border-b border-dashed border-black/20 dark:border-white/20 pb-1">{evt.difficulty} Route</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-alpine-navy/60 dark:text-alpine-snow/60">
                                                <AlertTriangle size={20} className="text-alpine-sunrise" />
                                                <span className="font-medium text-lg border-b border-dashed border-black/20 dark:border-white/20 pb-1">{evt.slotsLeft ?? (evt.totalSlots - (evt.participants?.length || 0))} Slots Left</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-auto">
                                            {isRegistered(evt) ? (
                                                <>
                                                    <button
                                                        onClick={() => handleUnregister(evt._id)}
                                                        disabled={registeringId === evt._id}
                                                        className="px-8 py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium rounded-full text-center hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-all flex justify-center items-center gap-2"
                                                    >
                                                        {registeringId === evt._id ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle size={18} /> Registered</>}
                                                    </button>
                                                    {evt.whatsappGroupUrl && (
                                                        <a
                                                            href={evt.whatsappGroupUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-8 py-4 bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] font-medium rounded-full text-center hover:bg-[#25D366]/30 transition-all flex justify-center items-center gap-2 group/wa"
                                                        >
                                                            <MessageCircle size={18} className="group-hover/wa:scale-110 transition-transform" /> Join Expedition Chat
                                                        </a>
                                                    )}
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleRegister(evt._id)}
                                                    disabled={registeringId === evt._id}
                                                    className="px-8 py-4 bg-alpine-blue dark:bg-alpine-sunrise text-white font-medium rounded-full text-center hover:scale-105 transition-transform shadow-lg flex justify-center items-center gap-2"
                                                >
                                                    {registeringId === evt._id ? <Loader2 className="animate-spin" size={18} /> : 'Join this trip'}
                                                </button>
                                            )}
                                            {evt.ticketUrl && (
                                                <a
                                                    href={evt.ticketUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-8 py-4 bg-alpine-sunrise/20 border border-alpine-sunrise/40 text-alpine-sunrise font-medium rounded-full text-center hover:bg-alpine-sunrise/30 transition-all flex justify-center items-center gap-2 group/tkt"
                                                >
                                                    Get Tickets <ArrowRight size={18} className="group-hover/tkt:translate-x-1 transition-transform" />
                                                </a>
                                            )}
                                            <MorphLink to={`/events/${evt._id}`} className="px-8 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-alpine-navy dark:text-alpine-snow font-medium rounded-full text-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex justify-center items-center gap-2 group/btn">
                                                View Briefing <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                                            </MorphLink>
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
