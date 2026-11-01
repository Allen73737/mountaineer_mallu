import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, MapPin, Clock, Info, CheckCircle2, Bell, BellOff, Mountain, ArrowRight, Sparkles, Route, CloudSun, Backpack, Quote, Award, Medal, Crown } from 'lucide-react';
import { usersApi, aiApi, eventsApi } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useAdaptiveTheme } from '../../store/useAdaptiveTheme';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ExpeditionTabSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';

// Simple Custom Calendar Component
const CustomCalendar = ({ expeditions }: { expeditions: any[] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    // Create an array of days to render
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const isExpeditionDay = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return expeditions.some(exp => exp.eventId?.date === dateStr);
    };

    return (
        <div className="bg-white/40 dark:bg-[#11141A]/60 border border-black/5 dark:border-white/5 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group w-full mx-auto">
            {/* Calendar Premium Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-alpine-glacier/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-alpine-glacier/20 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-alpine-sunrise/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <button onClick={prevMonth} className="p-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors backdrop-blur-md border border-black/5 dark:border-white/5">
                        <svg className="w-4 h-4 text-alpine-navy dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <h3 className="text-2xl font-serif font-black tracking-widest uppercase bg-gradient-to-r from-alpine-navy to-alpine-navy/70 dark:from-white dark:to-white/50 bg-clip-text text-transparent">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                    <button onClick={nextMonth} className="p-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors backdrop-blur-md border border-black/5 dark:border-white/5">
                        <svg className="w-4 h-4 text-alpine-navy dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>
                
                <div className="grid grid-cols-7 gap-2 text-center mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-[10px] font-bold uppercase tracking-widest text-alpine-navy/40 dark:text-white/40">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {days.map((day, idx) => {
                        if (day === null) return <div key={`empty-${idx}`} className="h-10 sm:h-12 w-full" />;
                        
                        const isExp = isExpeditionDay(day);
                        const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

                        return (
                            <div 
                                key={day} 
                                className={`h-10 sm:h-12 w-full flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 relative cursor-pointer
                                    ${isExp ? 'bg-gradient-to-br from-alpine-glacier to-blue-600 text-[#0A0D14] shadow-[0_10px_20px_rgba(163,201,226,0.4)] scale-[1.05] z-10 border border-white/20' : ''}
                                    ${isToday && !isExp ? 'border-2 border-alpine-glacier text-alpine-glacier bg-alpine-glacier/10' : ''}
                                    ${!isExp && !isToday ? 'hover:bg-black/5 dark:hover:bg-white/5 hover:scale-110 text-alpine-navy/80 dark:text-white/80' : ''}
                                `}
                            >
                                {day}
                                {isExp && (
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-alpine-sunrise border-2 border-[#11141A] shadow-sm" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export const UserExpeditionsTab = () => {
    const { user } = useAuthStore();
    const [expeditions, setExpeditions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [briefing, setBriefing] = useState<any>(null);
    const [briefingLoading, setBriefingLoading] = useState(false);
    const { setTheme, setLoading: setThemeLoading } = useAdaptiveTheme();

    const [allEvents, setAllEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [addingEvent, setAddingEvent] = useState(false);

    useEffect(() => {
        fetchExpeditions();
        fetchAvailableEvents();
    }, []);

    const fetchAvailableEvents = async () => {
        try {
            const data = await eventsApi.list(1, 50);
            setAllEvents(data.events);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        }
    };

    const handleAddExpedition = async () => {
        if (!selectedEventId) return;
        setAddingEvent(true);
        try {
            await usersApi.toggleExpeditionReminder(selectedEventId, true);
            await fetchExpeditions();
            setSelectedEventId('');
        } catch (error) {
            console.error('Failed to add expedition:', error);
        } finally {
            setAddingEvent(false);
        }
    };

    // A failed load shows an error with retry, not "no expeditions" (which would wrongly say there are none)
    const [loadError, setLoadError] = useState(false);
    const fetchExpeditions = async () => {
        setLoadError(false);
        try {
            const data = await usersApi.getMyExpeditions();
            setExpeditions(data.expeditions);
        } catch (error) {
            console.error('Failed to fetch expeditions:', error);
            setLoadError(true);
        } finally {
            setLoading(false);
        }
    };

    const toggleReminder = async (eventId: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setExpeditions(prev => prev.map(exp => 
                exp.eventId._id === eventId ? { ...exp, enabled: !currentStatus } : exp
            ));
            await usersApi.toggleExpeditionReminder(eventId, !currentStatus);
        } catch (error) {
            console.error('Failed to toggle reminder:', error);
            // Revert on error
            fetchExpeditions();
        }
    };

    const upcomingExpeditions = expeditions.filter(e => new Date(e.eventId.date) >= new Date());
    const pastExpeditions = expeditions.filter(e => new Date(e.eventId.date) < new Date());

    // Artificial logic for Passport Stats (based on past expeditions)
    const totalElevationGained = pastExpeditions.length * Math.floor(Math.random() * 2000 + 1000); 
    const badges = [
        { id: '1', name: 'First Summit', icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', unlocked: pastExpeditions.length > 0 },
        { id: '2', name: 'Winter Veteran', icon: Mountain, color: 'text-alpine-glacier', bg: 'bg-alpine-glacier/10', border: 'border-alpine-glacier/20', unlocked: pastExpeditions.length > 2 },
        { id: '3', name: 'Altitude Master', icon: Crown, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', unlocked: totalElevationGained > 8000 },
    ];

    // Fetch AI route briefing and adaptive theme for the next upcoming expedition
    useEffect(() => {
        if (upcomingExpeditions.length > 0 && !briefing) {
            const nextExp = upcomingExpeditions[0];
            const eventId = nextExp.eventId._id;

            // Fetch route briefing
            setBriefingLoading(true);
            aiApi.getRouteBriefing(eventId)
                .then(data => setBriefing(data.briefing))
                .catch(err => console.error('Route briefing failed:', err))
                .finally(() => setBriefingLoading(false));

            // Fetch adaptive theme
            setThemeLoading(true);
            aiApi.getThemeSuggestion({
                title: nextExp.eventId.title,
                location: nextExp.eventId.location,
                difficulty: nextExp.eventId.difficulty,
                type: nextExp.eventId.type
            })
                .then(data => setTheme(data.theme))
                .catch(err => console.error('Theme suggestion failed:', err))
                .finally(() => setThemeLoading(false));
        }
    }, [upcomingExpeditions.length]);

    if (loadError && !loading) {
        return (
            <ErrorState
                title="Your expeditions didn't load"
                message="We couldn't reach the server to fetch your expeditions. Nothing has been lost — try again in a moment."
                onRetry={() => { setLoading(true); fetchExpeditions(); }}
            />
        );
    }

    if (loading) {
        return <ExpeditionTabSkeleton />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-alpine-glacier/20 text-alpine-glacier rounded-2xl">
                        <Mountain size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-serif font-bold tracking-wide">Operations & Passport</h2>
                        <p className="text-alpine-navy/60 dark:text-white/50 mt-1">Manage your schedule and view your mountaineering logbook.</p>
                    </div>
                </div>
                <Link to="/events" className="group shrink-0">
                    <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-alpine-glacier/10 hover:bg-alpine-glacier/20 border border-alpine-glacier/20 text-alpine-glacier font-semibold text-sm transition-all">
                        Explore Expeditions
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            </div>

            {/* ═══ EXPEDITION PASSPORT (DIGITAL LOGBOOK) ═══ */}
            <div className="p-8 rounded-[2rem] bg-white/60 dark:bg-[#11141A]/60 border border-black/5 dark:border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-alpine-glacier/10 via-transparent to-transparent opacity-50 blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                    {/* User ID Card */}
                    <div className="w-full md:w-1/3 flex flex-col items-center p-6 rounded-2xl bg-gradient-to-b from-white/40 to-white/10 dark:from-white/5 dark:to-transparent border border-black/10 dark:border-white/10 shadow-inner">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-alpine-glacier/30 shadow-[0_0_20px_rgba(163,201,226,0.3)] mb-4">
                            <img src={user?.avatar || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200'} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-serif font-bold text-xl uppercase tracking-wider">{user?.name}</h3>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-alpine-glacier mb-6">Verified Explorer</p>
                        
                        <div className="w-full space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
                                <span className="text-xs font-bold uppercase tracking-wider text-alpine-navy/50 dark:text-white/50">Total Treks</span>
                                <span className="font-bold text-lg">{pastExpeditions.length}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
                                <span className="text-xs font-bold uppercase tracking-wider text-alpine-navy/50 dark:text-white/50">Elevation Gained</span>
                                <span className="font-bold text-lg text-emerald-500">{totalElevationGained.toLocaleString()}m</span>
                            </div>
                            <div className="flex justify-between items-center pb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-alpine-navy/50 dark:text-white/50">Status</span>
                                <span className="font-bold text-sm bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded-md">Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Passport Stamps & Badges */}
                    <div className="w-full md:w-2/3 flex flex-col">
                        <h4 className="font-serif font-bold text-xl mb-4 flex items-center gap-2">
                            <Medal size={20} className="text-alpine-glacier" /> Earned Accolades
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            {badges.map(badge => (
                                <div key={badge.id} className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${badge.unlocked ? `${badge.bg} ${badge.border}` : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 grayscale opacity-50'}`}>
                                    <badge.icon size={32} className={`${badge.color} mb-3`} />
                                    <p className="font-bold text-sm">{badge.name}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-alpine-navy/50 dark:text-white/50">
                                        {badge.unlocked ? 'Unlocked' : 'Locked'}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <h4 className="font-serif font-bold text-xl mb-4 flex items-center gap-2">
                            <CheckCircle2 size={20} className="text-emerald-500" /> Logbook (Past Missions)
                        </h4>
                        <div className="flex-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 overflow-y-auto max-h-48 custom-scrollbar">
                            {pastExpeditions.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-sm font-bold uppercase tracking-widest text-alpine-navy/30 dark:text-white/30">
                                    No completed missions yet
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {pastExpeditions.map(exp => (
                                        <div key={exp.eventId._id} className="relative group p-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 overflow-hidden">
                                            {/* Passport Stamp Effect */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-10 rotate-[-15deg] pointer-events-none">
                                                <div className="border-4 border-red-500 text-red-500 font-black text-2xl uppercase tracking-widest px-2 py-1 rounded-lg">CONQUERED</div>
                                            </div>
                                            <p className="font-bold text-sm truncate relative z-10">{exp.eventId.title}</p>
                                            <p className="text-[10px] uppercase tracking-wider text-alpine-navy/60 dark:text-white/60 relative z-10">{exp.eventId.date}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Route Briefing Card */}
            {upcomingExpeditions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative overflow-hidden rounded-3xl border border-alpine-glacier/20 bg-gradient-to-br from-alpine-glacier/5 via-transparent to-purple-500/5 backdrop-blur-md shadow-2xl"
                >
                    {/* Decorative glows */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-alpine-glacier/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />

                    <div className="relative z-10 p-6 md:p-8">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative">
                                <div className="p-2.5 rounded-xl bg-alpine-glacier/20 border border-alpine-glacier/30">
                                    <Sparkles size={22} className="text-alpine-glacier" />
                                </div>
                                <motion.div
                                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-alpine-glacier"
                                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-serif font-bold tracking-wide">AI Route Intelligence</h3>
                                <p className="text-xs text-alpine-navy/50 dark:text-white/40 font-medium">Personalized briefing for {upcomingExpeditions[0]?.eventId?.title}</p>
                            </div>
                        </div>

                        {briefingLoading ? (
                            <div className="space-y-4">
                                {[1,2,3].map(i => (
                                    <div key={i} className="h-5 bg-black/5 dark:bg-white/5 rounded-lg animate-pulse" style={{ width: `${85 - i * 15}%` }} />
                                ))}
                                <p className="text-xs text-alpine-navy/40 dark:text-white/30 italic mt-2">Analyzing route data...</p>
                            </div>
                        ) : briefing ? (
                            <div className="space-y-5">
                                {/* Summary */}
                                <p className="text-sm leading-relaxed text-alpine-navy/80 dark:text-white/70">{briefing.summary}</p>

                                {/* Difficulty Analysis */}
                                <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                                    <Route size={18} className="text-alpine-glacier shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-alpine-navy/50 dark:text-white/40 mb-1">Difficulty Analysis</p>
                                        <p className="text-sm text-alpine-navy/80 dark:text-white/70">{briefing.difficultyAnalysis}</p>
                                    </div>
                                </div>

                                {/* Key Waypoints */}
                                {briefing.keyWaypoints && briefing.keyWaypoints.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-alpine-navy/50 dark:text-white/40 mb-3">Key Waypoints</p>
                                        <div className="space-y-2">
                                            {briefing.keyWaypoints.map((wp: string, idx: number) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="flex items-start gap-3 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5"
                                                >
                                                    <span className="w-6 h-6 rounded-full bg-alpine-glacier/20 text-alpine-glacier text-xs font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                                                    <p className="text-sm text-alpine-navy/70 dark:text-white/60">{wp}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Weather + Gear Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                                        <CloudSun size={18} className="text-amber-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-alpine-navy/50 dark:text-white/40 mb-1">Weather Guidance</p>
                                            <p className="text-sm text-alpine-navy/70 dark:text-white/60">{briefing.weatherGuidance}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                                        <Backpack size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-alpine-navy/50 dark:text-white/40 mb-1">Gear Tip</p>
                                            <p className="text-sm text-alpine-navy/70 dark:text-white/60">{briefing.gearTip}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Motivational Note */}
                                {briefing.motivationalNote && (
                                    <div className="flex items-center gap-3 pt-2">
                                        <Quote size={14} className="text-alpine-glacier/50 shrink-0" />
                                        <p className="text-sm italic text-alpine-navy/50 dark:text-white/40">{briefing.motivationalNote}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-alpine-navy/40 dark:text-white/30">AI briefing unavailable for this expedition.</p>
                        )}
                    </div>
                </motion.div>
            )}

            <div className="flex flex-col lg:flex-row gap-8 mt-12">
                {/* Calendar View */}
                <div className="w-full lg:w-1/3">
                    <CustomCalendar expeditions={expeditions} />
                </div>

                {/* Expeditions List */}
                <div className="w-full lg:w-2/3 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <h3 className="text-2xl font-serif font-bold">Upcoming Operations</h3>
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedEventId}
                                onChange={(e) => setSelectedEventId(e.target.value)}
                                className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-alpine-navy dark:text-white focus:outline-none focus:border-alpine-glacier transition-colors"
                            >
                                <option value="" disabled>Select Official Trip...</option>
                                {allEvents.filter(e => !expeditions.some(myExp => myExp.eventId._id === e._id)).map(e => (
                                    <option key={e._id} value={e._id}>{e.title} ({e.date})</option>
                                ))}
                            </select>
                            <button
                                onClick={handleAddExpedition}
                                disabled={!selectedEventId || addingEvent}
                                className="px-4 py-2 bg-alpine-glacier text-alpine-navy rounded-lg text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {addingEvent ? 'Adding...' : 'Add Trip'}
                            </button>
                        </div>
                    </div>
                    
                    {upcomingExpeditions.length === 0 ? (
                        <div className="p-12 text-center bg-white/60 dark:bg-[#11141A] rounded-[2rem] border border-black/5 dark:border-white/5 shadow-xl flex flex-col items-center">
                            <Mountain size={48} className="text-alpine-navy/20 dark:text-white/20 mb-4" />
                            <p className="text-lg font-serif text-alpine-navy/60 dark:text-white/60 font-medium">You have no upcoming expeditions assigned.</p>
                            <p className="text-sm text-alpine-navy/40 dark:text-white/40 mt-2">Select a trip above to add it to your command center.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {upcomingExpeditions.map((exp, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                                    key={exp.eventId._id} 
                                    className="p-4 sm:p-6 rounded-[2rem] bg-white/80 dark:bg-[#11141A]/90 border border-black/5 dark:border-white/5 shadow-xl hover:shadow-2xl backdrop-blur-xl flex flex-col md:flex-row gap-6 items-center group transition-[color,background-color,border-color,box-shadow] duration-500 hover:-translate-y-1 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-alpine-glacier/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                    
                                    <div className="w-full md:w-32 h-48 md:h-32 rounded-2xl overflow-hidden shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.2)] relative">
                                        <img src={exp.eventId.image} alt={exp.eventId.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                                    </div>
                                    <div className="flex-1 w-full text-center md:text-left relative z-10">
                                        <h4 className="text-xl sm:text-2xl font-black font-serif mb-3 tracking-wide">{exp.eventId.title}</h4>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-semibold text-alpine-navy/70 dark:text-white/70">
                                            <span className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-black/5 dark:border-white/5"><CalendarIcon size={14} className="text-alpine-glacier"/> {exp.eventId.date}</span>
                                            <span className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-black/5 dark:border-white/5"><Clock size={14} className="text-alpine-glacier"/> {exp.eventId.time}</span>
                                            <span className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-black/5 dark:border-white/5"><MapPin size={14} className="text-alpine-glacier"/> {exp.eventId.location}</span>
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex flex-row md:flex-col items-center justify-center gap-4 md:border-l md:border-t-0 border-t border-black/10 dark:border-white/10 md:pl-8 pt-4 md:pt-0 w-full md:w-auto relative z-10">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-alpine-navy/40 dark:text-white/40">Status</span>
                                            <button 
                                                onClick={() => toggleReminder(exp.eventId._id, exp.enabled)}
                                                className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${exp.enabled ? 'bg-alpine-glacier text-alpine-navy shadow-[0_0_25px_rgba(163,201,226,0.6)] border border-white/20' : 'bg-black/5 dark:bg-white/5 text-alpine-navy/50 dark:text-white/50 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10'}`}
                                                title={exp.enabled ? "Reminder Active" : "Reminder Inactive"}
                                            >
                                                {exp.enabled ? <Bell size={24} className="animate-[pulse_3s_ease-in-out_infinite]" /> : <BellOff size={24} />}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
