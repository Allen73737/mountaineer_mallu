import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Instagram, Facebook, ArrowRight, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Contact = () => {
    const { t } = useTranslation();
    return (
        <section id="contact" className="py-20 md:py-28 px-6 md:px-12 bg-alpine-navy dark:bg-black text-alpine-snow relative overflow-hidden">

            {/* Topographic pattern background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(163,201,226,0.3) 40px, rgba(163,201,226,0.3) 41px),
                repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(163,201,226,0.2) 40px, rgba(163,201,226,0.2) 41px)`
            }} />

            {/* Ambient glow */}
            <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] rounded-full opacity-[0.04] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(226,160,113,0.6) 0%, transparent 60%)' }} />

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 md:gap-16 md:items-center h-full relative z-10">

                {/* Left Side: Call to Action */}
                <div className="md:w-1/2 flex flex-col justify-center">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.6 }}
                        className="text-alpine-sunrise text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-3 md:mb-4"
                    >
                        {t('contact.get_in_touch')}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 100, rotate: -5 }}
                        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ type: "spring", bounce: 0.4, duration: 1.5 }}
                    >
                        <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif mb-6 md:mb-8 leading-[0.9] text-alpine-glacier drop-shadow-lg" dangerouslySetInnerHTML={{ __html: t('contact.base_camp').replace(' ', '<br />') }}>
                        </h2>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="text-white/60 font-light text-lg md:text-2xl max-w-md mb-8 md:mb-12"
                    >
                        {t('contact.description')}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.8, delay: 0.5, type: 'spring' }}
                    >
                        <Link
                            to="/contact"
                            className="group flex items-center justify-between px-6 md:px-8 py-5 md:py-6 premium-card rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-500 w-full max-w-md cursor-pointer shadow-2xl"
                        >
                            <div className="text-base md:text-xl font-serif text-white group-hover:text-alpine-sunrise transition-colors">{t('contact.open_communications')}</div>
                            <ArrowRight size={24} className="text-alpine-glacier group-hover:translate-x-4 transition-transform duration-500" />
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="flex gap-4 md:gap-6 mt-10 md:mt-16 text-white/40"
                    >
                        <a href="#" className="hover:text-alpine-sunrise hover:-translate-y-2 transition-all p-2.5 md:p-3 rounded-full hover:bg-white/5 border border-white/5 hover:border-white/10"><Instagram size={22} /></a>
                        <a href="#" className="hover:text-alpine-sunrise hover:-translate-y-2 transition-all p-2.5 md:p-3 rounded-full hover:bg-white/5 border border-white/5 hover:border-white/10"><Facebook size={22} /></a>
                        <a href="#" className="hover:text-alpine-sunrise hover:-translate-y-2 transition-all p-2.5 md:p-3 rounded-full hover:bg-white/5 border border-white/5 hover:border-white/10"><Mail size={22} /></a>
                    </motion.div>
                </div>

                {/* Right Side: Info Cards */}
                <div className="md:w-1/2 flex items-center">
                    <motion.div
                        initial={{ opacity: 0, x: 200 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.1 }}
                        transition={{ duration: 1.5, type: "spring", bounce: 0.2 }}
                        className="flex flex-col lg:flex-row gap-4 md:gap-6 w-full"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                            className="w-full flex-1 premium-card p-8 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl border border-white/[0.06] group flex flex-col justify-center"
                        >
                            <MapPin size={36} className="text-alpine-glacier mb-6 md:mb-8 group-hover:scale-110 transition-transform" />
                            <h3 className="font-serif text-2xl md:text-3xl mb-3 md:mb-4">{t('contact.hq')}</h3>
                            <p className="text-white/60 font-light text-base md:text-lg">
                                Alpenstrasse 42<br />
                                82467 Garmisch-Partenkirchen<br />
                                Germany
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                            className="w-full flex-1 premium-card p-8 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl border border-white/[0.06] group flex flex-col justify-center"
                        >
                            <Phone size={36} className="text-alpine-glacier mb-6 md:mb-8 group-hover:scale-110 transition-transform" />
                            <h3 className="font-serif text-2xl md:text-3xl mb-3 md:mb-4">{t('contact.dispatch')}</h3>
                            <p className="text-white/60 font-light text-base md:text-lg mb-3 md:mb-4">
                                +49 (0) 1520 1234567<br />
                                Mon-Fri, 09:00 - 18:00
                            </p>
                            <p className="text-alpine-sunrise font-medium underline underline-offset-4 cursor-pointer text-sm md:text-base mt-auto">{t('contact.emergency_direct')}</p>
                        </motion.div>
                    </motion.div>
                </div>

            </div>

            {/* Bottom subtle divider */}
            <div className="mt-16 md:mt-12 section-divider opacity-50" />

            {/* Footer credits */}
            <div className="max-w-7xl mx-auto mt-6 md:mt-4 flex flex-col md:flex-row justify-between items-center gap-4 px-4">
                <p className="text-white/40 text-xs tracking-[0.2em] uppercase font-semibold glow-text text-center md:text-left">{t('contact.rights')}</p>
                <div className="flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-alpine-glacier/30 hidden md:block"></span>
                    <p className="font-serif text-alpine-glacier/80 text-xs italic tracking-wider shadow-sm">{t('contact.crafted_with_love')}</p>
                    <span className="w-8 h-[1px] bg-alpine-glacier/30 hidden md:block"></span>
                </div>
            </div>
        </section>
    );
};
