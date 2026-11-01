import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Linkedin, Mail, Mountain, Compass, Shield, Award, X, Sparkles, Filter } from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';
import { ImageWithSkeleton } from '../components/ui/Skeleton';
import { pillarsApi } from '../lib/api';
import { toast } from 'sonner';
import { CreditTitle } from '../components/ui/CreditTitle';

interface TeamMember {
    id: string | number;
    _id?: string;
    name: string;
    role: string;
    image: string;
    quote?: string;
    bio: string;
    specialty?: string;
    summits?: string;
    experience?: string;
}

const DEFAULT_TEAM: TeamMember[] = [
    { 
        id: 1, 
        name: 'Arjun Menon', 
        role: 'Chief Expedition Leader & UIAGM Guide', 
        image: 'https://images.unsplash.com/photo-1458442310124-dde6edb43d10?q=80&w=800&h=1000&fit=crop', 
        bio: 'Certified UIAGM mountain guide with over 15 seasons in the Western Alps. Specializes in winter north face traverses, high-altitude crevasse rescue, and technical ice leading.',
        specialty: 'Extreme Altitude & Ice Navigation',
        summits: 'Mont Blanc (18x), Matterhorn (9x), Eiger (4x)',
        experience: '15+ Years'
    },
    { 
        id: 2, 
        name: 'Divya Ravindran', 
        role: 'Safety Coordinator & High-Altitude Medic', 
        image: 'https://images.unsplash.com/photo-1502126324834-38f8e02d7160?q=80&w=800&h=1000&fit=crop', 
        bio: 'Paramedic and mountain rescue volunteer. Plans the first-aid side of every trip and keeps an eye on how everyone is coping with altitude before a summit push.',
        specialty: 'Wilderness Trauma & Acclimatization',
        summits: 'Zugspitze (24x), Grossglockner (7x)',
        experience: '11 Years'
    },
    { 
        id: 3, 
        name: 'Basil Varghese', 
        role: 'Head of Gear & Expedition Logistics', 
        image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800&h=1000&fit=crop', 
        bio: 'Looks after the club\'s shared gear, sorts out transport and hut bookings, and makes sure nobody leaves for a trip without the right kit.',
        specialty: 'Rope work & mountain weather',
        summits: 'Ortler (12x), Monte Rosa (6x)',
        experience: '13 Years'
    },
    { 
        id: 4, 
        name: 'Aisha Thomas', 
        role: 'Lead Trail Scout & Meteorologist', 
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&h=1000&fit=crop', 
        bio: 'Atmospheric scientist and route pioneer. Breaks virgin snow paths in zero visibility and analyzes barometric drops to dictate go/no-go summit windows.',
        specialty: 'Micro-Climate Modeling & Route Finding',
        summits: 'Dolomites Via Ferrata (30+ routes), Breithorn (14x)',
        experience: '9 Years'
    },
    { 
        id: 5, 
        name: 'Rahul Krishnan', 
        role: 'Field Documentarian & High-Angle Camera', 
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&h=1000&fit=crop', 
        bio: 'Extreme-environment cinematographer capturing raw human endurance at sub-zero temperatures. His lens chronicles the authentic soul of our mountain brotherhood.',
        specialty: 'Sub-Zero Cinematography & Drone Scouting',
        summits: 'Matterhorn Hörnli Ridge, Mont Blanc',
        experience: '8 Years'
    },
    { 
        id: 6, 
        name: 'Sneha Nair', 
        role: 'Community Lead', 
        image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&h=1000&fit=crop', 
        bio: 'Keeps the community running — connects Malayalee hiking groups across Europe, organises beginner-friendly trips, and is the first person to call when something goes wrong.',
        specialty: 'Member Onboarding & Alpine Ethics',
        summits: 'Zugspitze, Allgäu Alps (40+ ascents)',
        experience: '10 Years'
    },
];

const ROLES = ['All', 'Guides', 'Medical & Safety', 'Community & Media'];

export const TeamPage = () => {
    const [team, setTeam] = useState<TeamMember[]>(DEFAULT_TEAM);
    const [selectedRole, setSelectedRole] = useState('All');
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

    useEffect(() => {
        const fetchPillars = async () => {
            try {
                const data = await pillarsApi.list();
                if (data && data.length > 0) {
                    const mapped: TeamMember[] = data.map((item: any, idx: number) => ({
                        id: item._id || idx,
                        _id: item._id,
                        name: item.name,
                        role: item.role,
                        image: item.image,
                        quote: item.quote,
                        bio: item.quote ? `"${item.quote}" — Committed to advancing safety and community excellence on every high-altitude route.` : 'Experienced alpine leader dedicated to the Mountaineer Mallu brotherhood.',
                        specialty: 'Alpine Leadership & Safety',
                        summits: 'Alps Multi-Peak',
                        experience: 'Verified UIAGM Standard'
                    }));
                    setTeam(mapped);
                }
            } catch (err) {
                // Keep default team
            }
        };

        fetchPillars();
    }, []);

    const filteredTeam = useMemo(() => {
        if (selectedRole === 'All') return team;
        if (selectedRole === 'Guides') return team.filter(m => m.role.toLowerCase().includes('guide') || m.role.toLowerCase().includes('leader'));
        if (selectedRole === 'Medical & Safety') return team.filter(m => m.role.toLowerCase().includes('medic') || m.role.toLowerCase().includes('safety') || m.role.toLowerCase().includes('scout'));
        if (selectedRole === 'Community & Media') return team.filter(m => m.role.toLowerCase().includes('logistics') || m.role.toLowerCase().includes('community') || m.role.toLowerCase().includes('camera'));
        return team;
    }, [team, selectedRole]);

    const handleCopyEmail = (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const email = `${name.toLowerCase().replace(/[^a-z]/g, '')}@mountaineermallu.com`;
        navigator.clipboard.writeText(email);
        toast.success(`Copied official dispatch email for ${name}!`);
    };

    return (
        <div className="min-h-screen bg-alpine-snow dark:bg-black text-alpine-navy dark:text-alpine-snow pt-32 pb-24 px-6 md:px-12 relative overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute top-24 right-1/4 w-[500px] h-[500px] bg-alpine-blue/5 dark:bg-alpine-sunrise/5 rounded-full blur-[140px] pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto">
                <BackButton backTo="/" />

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-12 border-b border-black/10 dark:border-white/10 pb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, type: 'spring' }}
                    >
                        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-alpine-blue/10 dark:bg-alpine-sunrise/10 text-alpine-blue dark:text-alpine-sunrise text-xs font-bold tracking-widest uppercase mb-4">
                            <Shield size={14} /> UIAGM Certified Leadership
                        </span>
                        <CreditTitle lines={['Our team']} creditClassName="text-alpine-blue dark:text-alpine-sunrise" className="text-5xl md:text-8xl font-serif font-normal tracking-tight" />
                        <p className="text-lg md:text-2xl font-light text-alpine-navy/60 dark:text-alpine-snow/60 max-w-2xl leading-relaxed">
                            The architects of ascension. Meet the veteran guides, trauma medics, and route scouts that make impossible objectives routine.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 12, delay: 0.3 }}
                        className="w-28 h-28 md:w-32 md:h-32 rounded-full border border-alpine-navy/20 dark:border-alpine-snow/20 flex flex-col items-center justify-center gap-2 mb-4 bg-white/40 dark:bg-black/30 backdrop-blur-md shadow-lg"
                    >
                        <Mountain className="text-alpine-blue dark:text-alpine-sunrise" size={28} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Est. 2022</span>
                    </motion.div>
                </div>

                {/* Filter Selector */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-14">
                    <div className="flex flex-wrap gap-2">
                        {ROLES.map(role => (
                            <button
                                key={role}
                                onClick={() => setSelectedRole(role)}
                                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                                    selectedRole === role
                                        ? 'bg-alpine-navy text-white dark:bg-white dark:text-black shadow-md scale-105'
                                        : 'bg-black/5 dark:bg-white/5 text-alpine-navy/70 dark:text-alpine-snow/70 hover:bg-black/10 dark:hover:bg-white/10'
                                }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs uppercase font-bold tracking-wider text-alpine-navy/40 dark:text-alpine-snow/40">
                        {filteredTeam.length} Active Command Officers
                    </span>
                </div>

                {/* The Team Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 gap-y-20">
                    {filteredTeam.map((member, i) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.7, delay: (i % 3) * 0.1 }}
                            className="group flex flex-col justify-between"
                        >
                            {/* Image Card */}
                            <div>
                                <div 
                                    onClick={() => setSelectedMember(member)}
                                    className="reveal-img [--rev-radius:2.5rem] aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden mb-6 relative glass-dark border border-black/5 dark:border-white/10 shadow-2xl cursor-pointer"
                                >
                                    <ImageWithSkeleton
                                        src={member.image}
                                        alt={member.name}
                                        containerClassName="w-full h-full"
                                        className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-108 transition-all duration-1000 ease-out"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                    {/* Specialty Tag */}
                                    {member.specialty && (
                                        <div className="absolute top-5 left-5 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-alpine-navy dark:text-alpine-snow shadow-sm border border-black/5 dark:border-white/10">
                                            {member.specialty}
                                        </div>
                                    )}

                                    {/* Action Contact Overlay */}
                                    <div className="absolute top-5 right-5 flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                        <button 
                                            onClick={(e) => handleCopyEmail(member.name, e)}
                                            className="w-10 h-10 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-center hover:bg-alpine-blue hover:text-white dark:hover:bg-alpine-sunrise dark:hover:text-black transition-colors shadow-md"
                                            title="Copy email address"
                                        >
                                            <Mail size={16} />
                                        </button>
                                        <button 
                                            onClick={() => setSelectedMember(member)}
                                            className="w-10 h-10 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-center hover:bg-alpine-blue hover:text-white dark:hover:bg-alpine-sunrise dark:hover:text-black transition-colors shadow-md"
                                            title="View Full Credentials"
                                        >
                                            <Compass size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Typography Layer */}
                                <div className="px-2">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-0.5 bg-alpine-blue dark:bg-alpine-sunrise w-6" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-alpine-blue dark:text-alpine-sunrise">
                                            {member.role}
                                        </span>
                                    </div>
                                    <h2 
                                        onClick={() => setSelectedMember(member)}
                                        className="text-3xl font-serif font-normal mb-3 cursor-pointer group-hover:text-alpine-blue dark:group-hover:text-alpine-sunrise transition-colors"
                                    >
                                        {member.name}
                                    </h2>
                                    <p className="text-xs text-alpine-navy/70 dark:text-alpine-snow/70 font-light leading-relaxed line-clamp-3 mb-4">
                                        {member.bio}
                                    </p>
                                </div>
                            </div>

                            {/* View Profile Link */}
                            <div className="px-2 pt-3 border-t border-black/5 dark:border-white/5 flex justify-between items-center text-xs">
                                <button
                                    onClick={() => setSelectedMember(member)}
                                    className="font-bold uppercase tracking-wider text-alpine-blue dark:text-alpine-sunrise hover:underline flex items-center gap-1.5"
                                >
                                    Expedition Credentials & Dossier &rarr;
                                </button>
                                <span className="text-[11px] font-semibold text-alpine-navy/40 dark:text-alpine-snow/40">
                                    {member.experience || '10+ Yrs'}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ─── Member Credentials Dossier Modal ───────────────────── */}
            <AnimatePresence>
                {selectedMember && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedMember(null)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110]"
                        />
                        <div className="fixed inset-0 z-[111] flex items-center justify-center p-4 md:p-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="w-full max-w-2xl bg-alpine-snow dark:bg-[#080B12] border border-black/10 dark:border-white/15 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden"
                            >
                                <button
                                    onClick={() => setSelectedMember(null)}
                                    className="absolute top-6 right-6 w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:scale-110 transition-transform"
                                >
                                    <X size={18} />
                                </button>

                                <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
                                    <img
                                        src={selectedMember.image}
                                        alt={selectedMember.name}
                                        className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover shadow-lg border border-black/10 dark:border-white/10"
                                    />
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-alpine-blue dark:text-alpine-sunrise">
                                            {selectedMember.role}
                                        </span>
                                        <h3 className="text-3xl font-serif font-normal mt-1 mb-2">{selectedMember.name}</h3>
                                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                            <Award size={14} /> UIAGM Standard Field Verified
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8 text-sm text-alpine-navy/80 dark:text-alpine-snow/80 leading-relaxed font-light">
                                    <p>{selectedMember.bio}</p>
                                    {selectedMember.quote && (
                                        <div className="p-4 rounded-2xl bg-alpine-blue/5 dark:bg-alpine-sunrise/5 border-l-4 border-alpine-blue dark:border-alpine-sunrise italic font-serif text-base">
                                            "{selectedMember.quote}"
                                        </div>
                                    )}
                                </div>

                                {/* Credentials Matrix */}
                                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 text-xs mb-6">
                                    <div>
                                        <span className="block text-alpine-navy/50 dark:text-alpine-snow/50 uppercase tracking-widest font-bold text-[10px] mb-1">
                                            Summit Portfolio
                                        </span>
                                        <span className="font-bold">{selectedMember.summits || 'Mont Blanc, Matterhorn, Zugspitze'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-alpine-navy/50 dark:text-alpine-snow/50 uppercase tracking-widest font-bold text-[10px] mb-1">
                                            Operational Specialty
                                        </span>
                                        <span className="font-bold">{selectedMember.specialty || 'High Alpine Expedition Leading'}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => handleCopyEmail(selectedMember.name, e)}
                                    className="w-full py-3.5 bg-alpine-blue dark:bg-alpine-sunrise text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
                                >
                                    <Mail size={16} /> Get in touch
                                </button>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
