import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, MapPin, Clock, Info, CheckCircle2, Bell, BellOff, Mountain, ArrowRight } from 'lucide-react';
import { usersApi } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Link } from 'react-router-dom';

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
        <div className="bg-white/5 dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
                <button onClick={prevMonth} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">&lt;</button>
                <h3 className="text-xl font-serif font-bold tracking-wide">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                <button onClick={nextMonth} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">&gt;</button>
            </div>
            
            <div className="grid grid-cols-7 gap-2 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-xs font-semibold text-alpine-navy/50 dark:text-white/50">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {days.map((day, idx) => {
                    if (day === null) return <div key={`empty-${idx}`} />;
                    
                    const isExp = isExpeditionDay(day);
                    const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

                    return (
                        <div 
                            key={day} 
                            className={`h-10 w-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-300
                                ${isExp ? 'bg-alpine-glacier text-alpine-navy shadow-[0_0_15px_rgba(163,201,226,0.5)] scale-110' : ''}
                                ${isToday && !isExp ? 'border border-alpine-glacier text-alpine-glacier' : ''}
                                ${!isExp && !isToday ? 'hover:bg-black/5 dark:hover:bg-white/5' : ''}
                            `}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const UserExpeditionsTab = () => {
    const { user } = useAuthStore();
    const [expeditions, setExpeditions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpeditions();
    }, []);

    const fetchExpeditions = async () => {
        try {
            const data = await usersApi.getMyExpeditions();
            setExpeditions(data.expeditions);
        } catch (error) {
            console.error('Failed to fetch expeditions:', error);
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-4 border-alpine-glacier border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const upcomingExpeditions = expeditions.filter(e => new Date(e.eventId.date) >= new Date());
    const pastExpeditions = expeditions.filter(e => new Date(e.eventId.date) < new Date());

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
                        <h2 className="text-3xl font-serif font-bold tracking-wide">My Expeditions</h2>
                        <p className="text-alpine-navy/60 dark:text-white/50 mt-1">Track your hikes, manage your schedule, and set reminders.</p>
                    </div>
                </div>
                <Link to="/events" className="group shrink-0">
                    <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-alpine-glacier/10 hover:bg-alpine-glacier/20 border border-alpine-glacier/20 text-alpine-glacier font-semibold text-sm transition-all">
                        Explore Expeditions
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            </div>

            {/* Infographics Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                    className="p-6 rounded-3xl bg-gradient-to-br from-alpine-glacier/20 to-transparent border border-alpine-glacier/30 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Mountain size={64} />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-alpine-navy/70 dark:text-white/70 mb-2">Total Treks</p>
                    <h3 className="text-5xl font-black font-serif text-alpine-glacier">{expeditions.length}</h3>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                    className="p-6 rounded-3xl bg-gradient-to-br from-alpine-sunrise/20 to-transparent border border-alpine-sunrise/30 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                        <CalendarIcon size={64} />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-alpine-navy/70 dark:text-white/70 mb-2">Upcoming</p>
                    <h3 className="text-5xl font-black font-serif text-alpine-sunrise">{upcomingExpeditions.length}</h3>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                    className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-transparent border border-emerald-500/30 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                        <CheckCircle2 size={64} />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-alpine-navy/70 dark:text-white/70 mb-2">Completed</p>
                    <h3 className="text-5xl font-black font-serif text-emerald-500">{pastExpeditions.length}</h3>
                </motion.div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 mt-12">
                {/* Calendar View */}
                <div className="w-full lg:w-1/3">
                    <CustomCalendar expeditions={expeditions} />
                </div>

                {/* Expeditions List */}
                <div className="w-full lg:w-2/3 space-y-6">
                    <h3 className="text-2xl font-serif font-bold mb-4">Upcoming Treks</h3>
                    
                    {upcomingExpeditions.length === 0 ? (
                        <div className="p-8 text-center bg-black/5 dark:bg-white/5 rounded-3xl border border-black/10 dark:border-white/10">
                            <p className="text-alpine-navy/60 dark:text-white/60">You have no upcoming expeditions.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {upcomingExpeditions.map((exp, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                                    key={exp.eventId._id} 
                                    className="p-6 rounded-2xl bg-white/50 dark:bg-black/50 border border-black/5 dark:border-white/5 shadow-lg backdrop-blur-md flex flex-col md:flex-row gap-6 items-center"
                                >
                                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 shadow-inner">
                                        <img src={exp.eventId.image} alt={exp.eventId.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xl font-bold font-serif mb-2">{exp.eventId.title}</h4>
                                        <div className="flex flex-wrap gap-4 text-sm text-alpine-navy/70 dark:text-white/70">
                                            <span className="flex items-center gap-1.5"><CalendarIcon size={14} className="text-alpine-glacier"/> {exp.eventId.date}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={14} className="text-alpine-glacier"/> {exp.eventId.time}</span>
                                            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-alpine-glacier"/> {exp.eventId.location}</span>
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex flex-col items-center gap-2 border-l border-black/10 dark:border-white/10 pl-6">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-alpine-navy/50 dark:text-white/50">Reminder</span>
                                        <button 
                                            onClick={() => toggleReminder(exp.eventId._id, exp.enabled)}
                                            className={`p-3 rounded-full transition-all duration-300 ${exp.enabled ? 'bg-alpine-glacier text-alpine-navy shadow-[0_0_15px_rgba(163,201,226,0.4)]' : 'bg-black/10 dark:bg-white/10 text-alpine-navy/50 dark:text-white/50 hover:bg-black/20 dark:hover:bg-white/20'}`}
                                            title={exp.enabled ? "Turn reminder off" : "Turn reminder on"}
                                        >
                                            {exp.enabled ? <Bell size={20} /> : <BellOff size={20} />}
                                        </button>
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
