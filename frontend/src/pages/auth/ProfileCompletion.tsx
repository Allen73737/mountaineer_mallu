import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, UploadCloud, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { Loader2 } from '../../components/ui/BrandLoader';
import { useAuthStore } from '../../store/useAuthStore';

export const ProfileCompletion = () => {
    const [step, setStep] = useState(1);
    const { user, completeProfile, uploadAvatar } = useAuthStore();
    const navigate = useNavigate();

    const [location, setLocation] = useState({ place: '', city: '', state: '', zip: '' });
    const [contact, setContact] = useState({ phone: '', whatsapp: '' });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // If already complete, shouldn't be here, but just in case
    React.useEffect(() => {
        if (user?.isProfileComplete) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('Image must be less than 10MB.');
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(step + 1);
    };

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Upload avatar first if selected
            if (avatarFile) {
                await uploadAvatar(avatarFile);
            }

            // Complete profile
            await completeProfile({
                place: location.place,
                city: location.city,
                state: location.state,
                zip: location.zip,
                phone: contact.phone,
                whatsapp: contact.whatsapp,
            });

            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Failed to complete profile. Please try again.');
            setIsSubmitting(false);
        }
    };

    const stepVariants: Variants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
        exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#F7F4EF] dark:bg-[#070B12] text-alpine-navy dark:text-alpine-snow pt-16 pb-12">
            <div className="absolute inset-0 z-0">
                <div className="atelier-glow" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-alpine-snow/5 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-lg z-10 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9A5E43] dark:text-alpine-sunrise">Step {step} of 3</span>
                        <span className="font-mono text-xs text-alpine-navy/50 dark:text-white/50">{Math.round((step / 3) * 100)}%</span>
                    </div>
                    <div className="h-[3px] bg-alpine-navy/10 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-alpine-glacier via-alpine-sunrise to-alpine-gold"
                            initial={{ width: '0%' }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    </div>
                </motion.div>

                <div className="p-8 md:p-10 rounded-[1.75rem] bg-white dark:bg-white/[0.03] border border-alpine-navy/[0.08] dark:border-white/10 shadow-[0_30px_80px_-40px_rgba(8,40,76,0.45)] relative overflow-hidden">
                    {error && (
                        <div role="alert" className="bg-red-500/[0.08] border border-red-500/25 text-red-700 dark:text-red-200 rounded-xl p-3 mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.form key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleNext} className="space-y-6">
                                <div className="text-center mb-8">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-alpine-navy/[0.04] dark:bg-white/[0.06] border border-alpine-navy/[0.08] dark:border-white/10 text-[#9A5E43] dark:text-alpine-sunrise">
                                        <MapPin size={32} />
                                    </div>
                                    <h2 className="font-serif text-[2rem] leading-tight text-alpine-navy dark:text-alpine-snow mb-2">Where are you based?</h2>
                                    <p className="text-alpine-navy/60 dark:text-white/55 text-sm">Help us connect you with nearby events.</p>
                                </div>

                                <div className="space-y-4">
                                    <input type="text" value={location.place} onChange={e => setLocation({ ...location, place: e.target.value })} placeholder="Street address / Place" required className="form-input-glass" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" value={location.city} onChange={e => setLocation({ ...location, city: e.target.value })} placeholder="City" required className="form-input-glass" />
                                        <input type="text" value={location.state} onChange={e => setLocation({ ...location, state: e.target.value })} placeholder="State" required className="form-input-glass" />
                                    </div>
                                    <input type="text" value={location.zip} onChange={e => setLocation({ ...location, zip: e.target.value })} placeholder="Zip Code" required className="form-input-glass" />
                                </div>
                                <NextButton />
                            </motion.form>
                        )}

                        {step === 2 && (
                            <motion.form key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleNext} className="space-y-6">
                                <div className="text-center mb-8">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-alpine-navy/[0.04] dark:bg-white/[0.06] border border-alpine-navy/[0.08] dark:border-white/10 text-[#9A5E43] dark:text-alpine-sunrise">
                                        <MessageCircle size={32} />
                                    </div>
                                    <h2 className="font-serif text-[2rem] leading-tight text-alpine-navy dark:text-alpine-snow mb-2">Stay Connected</h2>
                                    <p className="text-alpine-navy/60 dark:text-white/55 text-sm">How should the community reach you?</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-alpine-navy/35 dark:text-white/40 group-focus-within:text-alpine-blue dark:group-focus-within:text-alpine-glacier transition-colors" size={18} />
                                        <input type="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} placeholder="Phone Number" required className="form-input-glass pl-12" />
                                    </div>
                                    <div className="relative group">
                                        <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400/70 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                        <input type="tel" value={contact.whatsapp} onChange={e => setContact({ ...contact, whatsapp: e.target.value })} placeholder="WhatsApp Number" required className="form-input-glass pl-12" />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setStep(1)} className="w-1/3 py-4 rounded-full border border-alpine-navy/15 dark:border-white/15 text-alpine-navy/80 dark:text-white/80 hover:bg-alpine-navy/[0.04] dark:hover:bg-white/[0.06] font-medium transition-colors">Back</button>
                                    <div className="w-2/3"><NextButton /></div>
                                </div>
                            </motion.form>
                        )}

                        {step === 3 && (
                            <motion.form key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleComplete} className="space-y-6">
                                <div className="text-center mb-8">
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        aria-label="Choose a profile photo"
                                        onClick={() => fileInputRef.current?.click()}
                                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                                        className="w-24 h-24 bg-alpine-navy/[0.03] dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-alpine-navy/20 dark:border-white/20 text-alpine-navy/50 dark:text-white/60 hover:text-alpine-navy dark:hover:text-white hover:border-alpine-blue dark:hover:border-alpine-glacier transition-colors cursor-pointer relative overflow-hidden group"
                                    >
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <UploadCloud size={32} />
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    <h2 className="font-serif text-[2rem] leading-tight text-alpine-navy dark:text-alpine-snow mb-2">Upload Avatar</h2>
                                    <p className="text-alpine-navy/60 dark:text-white/55 text-sm">Put a face to your expedition profile.</p>
                                </div>

                                <div className="bg-alpine-navy/[0.03] dark:bg-white/[0.03] p-4 rounded-xl border border-alpine-navy/[0.06] dark:border-white/5 text-sm text-alpine-navy/70 dark:text-white/70 flex items-start gap-3">
                                    <CheckCircle2 className="text-alpine-blue dark:text-alpine-glacier shrink-0 mt-0.5" size={18} />
                                    <p>Your profile is almost ready. You can always update these details later in your dashboard.</p>
                                </div>

                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setStep(2)} className="w-1/3 py-4 rounded-full border border-alpine-navy/15 dark:border-white/15 text-alpine-navy/80 dark:text-white/80 hover:bg-alpine-navy/[0.04] dark:hover:bg-white/[0.06] font-medium transition-colors" disabled={isSubmitting}>Back</button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="ascent-cta w-2/3 py-4 rounded-full bg-alpine-navy text-white dark:bg-gradient-to-r dark:from-[#E2A071] dark:to-[#C9A96E] dark:text-alpine-navy font-semibold text-base flex items-center justify-center gap-2 transition-[color,background-color,border-color,box-shadow] shadow-[0_14px_34px_-14px_rgba(8,40,76,0.7)] disabled:opacity-70"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <span>Complete Profile</span>}
                                    </motion.button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Theme-aware inputs matching the auth screens */}
            <style>{`
                .form-input-glass {
                    width: 100%;
                    background: #FFFFFF;
                    border: 1px solid rgba(8, 40, 76, 0.12);
                    border-radius: 1rem;
                    padding: 0.95rem 1.1rem;
                    color: #08284C;
                    font-size: 16px;
                    transition: border-color 0.3s, box-shadow 0.3s, background-color 0.3s;
                }
                .form-input-glass::placeholder { color: rgba(8, 40, 76, 0.42); }
                .form-input-glass:focus { outline: none; border-color: #4A6A8C; box-shadow: 0 0 0 4px rgba(74, 106, 140, 0.14); }
                .dark .form-input-glass { background: rgba(255, 255, 255, 0.035); border-color: rgba(255, 255, 255, 0.1); color: #F8FAF9; }
                .dark .form-input-glass::placeholder { color: rgba(226, 236, 245, 0.42); }
                .dark .form-input-glass:focus { border-color: rgba(163, 201, 226, 0.6); box-shadow: 0 0 0 4px rgba(163, 201, 226, 0.1); }
            `}</style>
        </div>
    );
};

const NextButton = () => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="ascent-cta w-full py-4 rounded-full bg-alpine-navy text-white dark:bg-gradient-to-r dark:from-[#E2A071] dark:to-[#C9A96E] dark:text-alpine-navy font-semibold text-base flex items-center justify-center gap-2 transition-[color,background-color,border-color,box-shadow] shadow-[0_14px_34px_-14px_rgba(8,40,76,0.7)] mt-6"
    >
        <span>Continue</span>
        <ChevronRight size={20} />
    </motion.button>
);
