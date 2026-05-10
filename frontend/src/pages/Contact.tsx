import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Instagram, Facebook, Twitter, Send, Loader2, CheckCircle } from 'lucide-react';
import { contactApi } from '../lib/api';
import { BackButton } from '../components/ui/BackButton';

export const ContactPage = () => {
    const [form, setForm] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!form.name || !form.email || !form.message) {
            setError('All fields are required.');
            return;
        }
        setSending(true);
        setError('');
        try {
            await contactApi.submit(form);
            setSent(true);
            setForm({ name: '', email: '', subject: 'General Inquiry', message: '' });
        } catch (err: any) {
            setError(err.message || 'Failed to send. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-alpine-navy text-alpine-snow pt-40 pb-24 px-6 md:px-12 relative overflow-hidden">

            {/* Background massive typography */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] md:text-[25rem] font-serif font-black text-white/5 whitespace-nowrap pointer-events-none select-none z-0">
                DISPATCH
            </div>

            <div className="max-w-7xl mx-auto w-full relative z-50">
                <BackButton />

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, type: "spring", damping: 15 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-6xl md:text-8xl font-serif font-black mb-6 text-alpine-glacier drop-shadow-md">
                        Mission Control
                    </h1>
                    <p className="text-xl md:text-2xl font-light text-white/60 max-w-2xl mx-auto">
                        Ready to deploy? General inquiries, bespoke expedition planning, or media requests. We are online.
                    </p>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">

                    {/* Left Side: Contact Information Cards */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full lg:w-5/12 space-y-8"
                    >
                        <div className="glass-dark bg-white/5 p-10 rounded-3xl border border-white/10 shadow-2xl hover:bg-white/10 transition-colors">
                            <MapPin size={32} className="text-alpine-glacier mb-6" />
                            <h3 className="font-serif text-3xl mb-4 text-white">Headquarters</h3>
                            <p className="text-white/60 font-light text-lg">
                                Alpenstrasse 42<br />
                                82467 Garmisch-Partenkirchen<br />
                                Germany
                            </p>
                        </div>

                        <div className="glass-dark bg-white/5 p-10 rounded-3xl border border-white/10 shadow-2xl hover:bg-white/10 transition-colors">
                            <Phone size={32} className="text-alpine-glacier mb-6" />
                            <h3 className="font-serif text-3xl mb-4 text-white">Direct Line</h3>
                            <p className="text-white/60 font-light text-lg mb-4">
                                +49 (0) 1520 1234567<br />
                                Mon-Fri, 09:00 - 18:00 CET
                            </p>
                            <div className="text-alpine-sunrise font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-alpine-sunrise animate-pulse" /> Emergency Comms Active
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <a href="#" className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-alpine-sunrise hover:text-alpine-navy transition-all hover:scale-110 shadow-lg"><Instagram size={24} /></a>
                            <a href="#" className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-alpine-sunrise hover:text-alpine-navy transition-all hover:scale-110 shadow-lg"><Facebook size={24} /></a>
                            <a href="#" className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-alpine-sunrise hover:text-alpine-navy transition-all hover:scale-110 shadow-lg"><Twitter size={24} /></a>
                            <a href="#" className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-alpine-sunrise hover:text-alpine-navy transition-all hover:scale-110 shadow-lg"><Mail size={24} /></a>
                        </div>
                    </motion.div>

                    {/* Right Side: Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="w-full lg:w-7/12"
                    >
                        <form className="glass-dark bg-white/5 p-10 md:p-16 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col gap-8">
                            <h3 className="font-serif text-4xl text-white mb-4">Transmit Signal</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold tracking-widest uppercase text-white/50 pl-4">Full Name</label>
                                    <input type="text" placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-white/5 border border-white/10 rounded-full px-6 py-4 outline-none focus:border-alpine-sunrise focus:bg-white/10 transition-all text-white" />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold tracking-widest uppercase text-white/50 pl-4">Email Coordinates</label>
                                    <input type="email" placeholder="john@domain.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="bg-white/5 border border-white/10 rounded-full px-6 py-4 outline-none focus:border-alpine-sunrise focus:bg-white/10 transition-all text-white" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold tracking-widest uppercase text-white/50 pl-4">Subject</label>
                                <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="bg-white/5 border border-white/10 rounded-full px-6 py-4 outline-none focus:border-alpine-sunrise focus:bg-white/10 transition-all text-white/50 appearance-none cursor-pointer">
                                    <option className="bg-alpine-navy">General Inquiry</option>
                                    <option className="bg-alpine-navy">Expedition Booking</option>
                                    <option className="bg-alpine-navy">Private Guiding</option>
                                    <option className="bg-alpine-navy">Media & Partnerships</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold tracking-widest uppercase text-white/50 pl-4">Message Payload</label>
                                <textarea rows={5} placeholder="State your intentions..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="bg-white/5 border border-white/10 rounded-3xl px-6 py-4 outline-none focus:border-alpine-sunrise focus:bg-white/10 transition-all text-white resize-none" />
                            </div>

                            {error && <p className="text-red-400 text-sm">{error}</p>}
                            {sent && <p className="text-emerald-400 text-sm flex items-center gap-2"><CheckCircle size={16} /> Message sent successfully!</p>}

                            <button type="button" onClick={handleSubmit} disabled={sending} className="group mt-4 self-start flex items-center gap-3 bg-alpine-glacier text-alpine-navy font-bold tracking-widest uppercase px-10 py-5 rounded-full hover:bg-alpine-sunrise hover:scale-105 transition-all shadow-[0_0_30px_rgba(163,201,226,0.3)] hover:shadow-[0_0_40px_rgba(226,160,113,0.6)]">
                                {sending ? <Loader2 className="animate-spin" size={20} /> : <>Launch <Send size={20} className="group-hover:translate-x-2 transition-transform" /></>}
                            </button>
                        </form>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};
