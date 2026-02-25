import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, Mail, Mountain } from 'lucide-react';

const TEAM = [
    { id: 1, name: 'Arjun M.', role: 'Founder & Chief Guide', image: 'https://images.unsplash.com/photo-1548365328-8c6db2b291d5?q=80&w=800&h=1000&fit=crop', bio: 'Certified UIAGM mountain guide with over 15 years in the Alps. Specializes in extreme altitude ascents and rescue operations.' },
    { id: 2, name: 'Divya R.', role: 'Safety Coordinator & Medic', image: 'https://images.unsplash.com/photo-1583852002596-fdfeb193306a?q=80&w=800&h=1000&fit=crop', bio: 'Paramedic and wilderness first responder. Ensures every route is meticulously planned for minimal risk.' },
    { id: 3, name: 'Basil V.', role: 'Head of Gear & Logistics', image: 'https://images.unsplash.com/photo-1552697275-c72eb62a98f1?q=80&w=800&h=1000&fit=crop', bio: 'Former alpine military operative. Oversees basecamp establishment and technical equipment supply.' },
    { id: 4, name: 'Aisha T.', role: 'Lead Trail Scout', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&h=1000&fit=crop', bio: 'Expert meteorologist and route finder. Breaks paths in zero visibility and dictates summit pushes.' },
    { id: 5, name: 'Rahul K.', role: 'Photographer / Videographer', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&h=1000&fit=crop', bio: 'Documentary filmmaker capturing raw emotion at 5000m. His lens tells the real story of the climb.' },
    { id: 6, name: 'Sneha N.', role: 'Community Manager', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&h=1000&fit=crop', bio: 'The bridge between the mountain and the world. Organizes meetups, events, and member resources.' },
];

export const TeamPage = () => {
    return (
        <div className="min-h-screen bg-alpine-snow dark:bg-black text-alpine-navy dark:text-alpine-snow pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12 border-b border-black/10 dark:border-white/10 pb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, type: 'spring' }}
                    >
                        <h1 className="text-6xl md:text-8xl font-serif font-black mb-6">Core<br />Command</h1>
                        <p className="text-xl md:text-2xl font-light text-alpine-navy/60 dark:text-alpine-snow/60 max-w-2xl">
                            The architects of ascension. Meet the UIAGM-certified guides, medics, and scouts that make the impossible routine.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 12, delay: 0.3 }}
                        className="w-32 h-32 rounded-full border border-alpine-navy/20 dark:border-alpine-snow/20 flex flex-col items-center justify-center gap-2 mb-4"
                    >
                        <Mountain className="text-alpine-blue dark:text-alpine-sunrise" size={32} />
                        <span className="text-xs font-bold uppercase tracking-widest">Est. 2022</span>
                    </motion.div>
                </div>

                {/* The Grid Array */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 gap-y-24">
                    {TEAM.map((member, i) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 100 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="group relative"
                        >
                            {/* Image Card */}
                            <div className="aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden mb-8 relative glass-dark border border-black/5 dark:border-white/10 shadow-2xl">
                                <img src={member.image} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1500ms]" />

                                <div className="absolute inset-0 bg-alpine-navy/80 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                                {/* Social links hidden until hover */}
                                <div className="absolute top-6 right-6 flex flex-col gap-3 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                                    <a href="#" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-alpine-sunrise hover:text-white text-white/80 transition-colors"><Instagram size={18} /></a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-alpine-sunrise hover:text-white text-white/80 transition-colors"><Linkedin size={18} /></a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-alpine-sunrise hover:text-white text-white/80 transition-colors"><Mail size={18} /></a>
                                </div>
                            </div>

                            {/* Typography Layer */}
                            <div className="px-4">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-px bg-alpine-blue dark:bg-alpine-sunrise w-8" />
                                    <span className="text-sm font-bold uppercase tracking-widest text-alpine-blue dark:text-alpine-sunrise">{member.role}</span>
                                </div>
                                <h2 className="text-4xl font-serif mb-4 flex items-center justify-between">
                                    {member.name}
                                </h2>
                                <p className="text-alpine-navy/70 dark:text-alpine-snow/70 font-light leading-relaxed">
                                    {member.bio}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </div>
    );
};
