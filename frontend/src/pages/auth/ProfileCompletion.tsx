import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, UploadCloud, CheckCircle2, ChevronRight, Loader2, User } from 'lucide-react';
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

    const stepVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
        exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-tr from-alpine-navy via-alpine-navy/95 to-alpine-blue/20 pt-20 pb-12">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-alpine-glacier/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-alpine-snow/5 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-lg z-10 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-sm font-medium">Step {step} of 3</span>
                        <span className="text-alpine-glacier text-sm font-bold">{Math.round((step / 3) * 100)}% Complete</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-alpine-glacier"
                            initial={{ width: '0%' }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    </div>
                </motion.div>

                <div className="p-8 md:p-10 rounded-3xl glass-dark border border-white/10 shadow-2xl relative overflow-hidden">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 rounded-xl p-3 mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.form key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleNext} className="space-y-6">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 text-alpine-glacier">
                                        <MapPin size={32} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">Where are you based?</h2>
                                    <p className="text-white/60 text-sm">Help us connect you with nearby events.</p>
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
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 text-alpine-glacier">
                                        <MessageCircle size={32} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">Stay Connected</h2>
                                    <p className="text-white/60 text-sm">How should the community reach you?</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-alpine-glacier transition-colors" size={18} />
                                        <input type="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} placeholder="Phone Number" required className="form-input-glass pl-12" />
                                    </div>
                                    <div className="relative group">
                                        <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400/70 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                        <input type="tel" value={contact.whatsapp} onChange={e => setContact({ ...contact, whatsapp: e.target.value })} placeholder="WhatsApp Number" required className="form-input-glass pl-12" />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setStep(1)} className="w-1/3 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all">Back</button>
                                    <div className="w-2/3"><NextButton /></div>
                                </div>
                            </motion.form>
                        )}

                        {step === 3 && (
                            <motion.form key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleComplete} className="space-y-6">
                                <div className="text-center mb-8">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-white/20 text-white/60 hover:text-white hover:border-alpine-glacier hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden group"
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
                                    <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">Upload Avatar</h2>
                                    <p className="text-white/60 text-sm">Put a face to your expedition profile.</p>
                                </div>

                                <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-sm text-white/70 flex items-start gap-3">
                                    <CheckCircle2 className="text-alpine-glacier shrink-0 mt-0.5" size={18} />
                                    <p>Your profile is almost ready. You can always update these details later in your dashboard.</p>
                                </div>

                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setStep(2)} className="w-1/3 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all" disabled={isSubmitting}>Back</button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-2/3 py-4 rounded-xl bg-alpine-glacier hover:bg-alpine-blue text-alpine-navy font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(163,201,226,0.3)]"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <span>Complete Profile</span>}
                                    </motion.button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Custom Styles for Form Inputs in this component */}
            <style>{`
                .form-input-glass {
                    width: 100%;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.75rem;
                    padding: 0.75rem 1rem;
                    color: white;
                    font-size: 0.875rem;
                    transition: all 0.3s;
                }
                .form-input-glass::placeholder { color: rgba(255,255,255,0.4); }
                .form-input-glass:focus { outline: none; box-shadow: 0 0 0 2px rgba(163,201,226,0.5); border-color: transparent; }
            `}</style>
        </div>
    );
};

const NextButton = () => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-lg flex items-center justify-center gap-2 transition-all mt-6"
    >
        <span>Continue</span>
        <ChevronRight size={20} />
    </motion.button>
);
