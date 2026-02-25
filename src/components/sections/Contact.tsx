import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Instagram, Facebook, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Contact = () => {
    return (
        <section id="contact" className="py-24 px-6 md:px-12 bg-alpine-navy dark:bg-black text-alpine-snow relative overflow-hidden">

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:items-center h-full">

                {/* Left Side: Call to Action */}
                <div className="md:w-1/2 flex flex-col justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 100, rotate: -5 }}
                        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ type: "spring", bounce: 0.5, duration: 1.5 }}
                    >
                        <h2 className="text-6xl md:text-8xl font-serif mb-8 leading-[0.9] text-alpine-glacier drop-shadow-lg">
                            Base<br />Camp
                        </h2>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="text-white/60 font-light text-2xl max-w-md mb-12"
                    >
                        Ready for your next ascent? Connect with us for expedition details, membership, or general inquiries.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.8, delay: 0.5, type: 'spring' }}
                    >
                        <Link
                            to="/contact"
                            className="group flex items-center justify-between px-8 py-6 glass-dark bg-white/5 rounded-2xl border border-white/20 hover:bg-white/10 transition-all duration-500 w-full max-w-md cursor-pointer shadow-2xl"
                        >
                            <div className="text-xl font-serif text-white group-hover:text-alpine-sunrise transition-colors">Open Communications</div>
                            <ArrowRight size={28} className="text-alpine-glacier group-hover:translate-x-4 transition-transform duration-500" />
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="flex gap-6 mt-16 text-white/50"
                    >
                        <a href="#" className="hover:text-alpine-sunrise hover:-translate-y-2 transition-all p-3 rounded-full hover:bg-white/5"><Instagram size={28} /></a>
                        <a href="#" className="hover:text-alpine-sunrise hover:-translate-y-2 transition-all p-3 rounded-full hover:bg-white/5"><Facebook size={28} /></a>
                        <a href="#" className="hover:text-alpine-sunrise hover:-translate-y-2 transition-all p-3 rounded-full hover:bg-white/5"><Mail size={28} /></a>
                    </motion.div>
                </div>

                {/* Right Side: Quick Info Cards Horizontal Layout */}
                <div className="md:w-1/2 overflow-hidden flex items-center">
                    <motion.div
                        initial={{ opacity: 0, x: 200 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.1 }}
                        transition={{ duration: 1.5, type: "spring", bounce: 0.2 }}
                        className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pt-8 px-4 -mx-4 w-full"
                    >

                        <motion.div
                            initial={{ opacity: 0, y: 100, rotateZ: 5 }}
                            whileInView={{ opacity: 1, y: 0, rotateZ: 0 }}
                            viewport={{ once: false, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                            className="w-72 flex-shrink-0 snap-center bg-black/30 backdrop-blur-md p-10 rounded-3xl border border-white/10 shadow-xl group hover:bg-black/50 transition-colors"
                        >
                            <MapPin size={48} className="text-alpine-glacier mb-8 group-hover:scale-110 transition-transform" />
                            <h3 className="font-serif text-3xl mb-4">HQ</h3>
                            <p className="text-white/60 font-light text-lg">
                                Alpenstrasse 42<br />
                                82467 Garmisch-Partenkirchen<br />
                                Germany
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 100, rotateZ: -5 }}
                            whileInView={{ opacity: 1, y: 0, rotateZ: 0 }}
                            viewport={{ once: false, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                            className="w-72 flex-shrink-0 snap-center bg-black/30 backdrop-blur-md p-10 rounded-3xl border border-white/10 shadow-xl group hover:bg-black/50 transition-colors"
                        >
                            <Phone size={48} className="text-alpine-glacier mb-8 group-hover:scale-110 transition-transform" />
                            <h3 className="font-serif text-3xl mb-4">Dispatch</h3>
                            <p className="text-white/60 font-light text-lg mb-4">
                                +49 (0) 1520 1234567<br />
                                Mon-Fri, 09:00 - 18:00
                            </p>
                            <p className="text-alpine-sunrise font-medium underline underline-offset-4 cursor-pointer">Emergency Direct</p>
                        </motion.div>

                    </motion.div>
                </div>

            </div>
        </section>
    );
};
