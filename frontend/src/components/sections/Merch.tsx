import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useInView } from 'framer-motion';
import { ShoppingBag, ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { usersApi } from '../../lib/api';

const PRODUCTS = [
    { id: 1, title: 'Ascent Pro Jacket', price: '€249', category: 'Outerwear', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&h=800&fit=crop' },
    { id: 2, title: 'Merino Base Layer', price: '€89', category: 'Apparel', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&h=800&fit=crop' },
    { id: 3, title: 'Expedition Pack 45L', price: '€189', category: 'Gear', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&h=800&fit=crop' },
    { id: 4, title: 'Carbon Trek Poles', price: '€129', category: 'Gear', img: 'https://images.unsplash.com/photo-1502224562085-639556652f33?q=80&w=600&h=800&fit=crop' },
    { id: 5, title: 'Alpine Sunglasses', price: '€159', category: 'Accessories', img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&h=800&fit=crop' }
];

const TiltCard = ({ children, className = '', style = {} }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const rotateX = isHovered ? (mousePosition.y / (cardRef.current?.offsetHeight || 1) - 0.5) * -15 : 0;
    const rotateY = isHovered ? (mousePosition.x / (cardRef.current?.offsetWidth || 1) - 0.5) * 15 : 0;

    return (
        <motion.div
            ref={cardRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
            animate={{ rotateX, rotateY, scale: isHovered ? 1.02 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`relative transform-style-3d ${className}`}
            style={style}
        >
            {children}
            {isHovered && (
                <div 
                    className="absolute inset-0 z-50 pointer-events-none opacity-40 transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.4) 0%, transparent 60%)`,
                    }}
                />
            )}
        </motion.div>
    );
};

export const Merch = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { amount: 0.1 });
    const rotateY = useMotionValue(0);
    const [isHovered, setIsHovered] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { isLoggedIn } = useAuthStore();
    const [wishlist, setWishlist] = useState<string[]>([]);

    // Load wishlist on mount
    useEffect(() => {
        if (isLoggedIn) {
            usersApi.getWishlist().then(data => {
                setWishlist((data.wishlist || []).map((w: any) => typeof w === 'string' ? w : w._id));
            }).catch(() => {});
        }
    }, [isLoggedIn]);

    const toggleWishlist = async (productId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoggedIn) return;
        setWishlist(prev =>
            prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
        try {
            await usersApi.toggleWishlist(productId);
        } catch {
            setWishlist(prev =>
                prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
            );
        }
    };

    // Auto-rotate with hardware RAF loop (0 React re-renders!)
    useEffect(() => {
        if (!isInView || isHovered) return;
        let animId: number;
        let lastT = 0;
        const step = (t: number) => {
            if (t - lastT >= 32) {
                if (typeof document === 'undefined' || !document.body.classList.contains('is-scrolling')) {
                    rotateY.set(rotateY.get() - 0.25);
                }
                lastT = t;
            }
            animId = requestAnimationFrame(step);
        };
        animId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animId);
    }, [isInView, isHovered, rotateY]);

    const angleSlice = 360 / PRODUCTS.length;
    const zRadius = 400;

    return (
        <section ref={sectionRef} id="merch" className="py-20 md:py-28 px-6 md:px-12 bg-transparent dark:bg-transparent relative overflow-hidden flex flex-col items-center justify-center min-h-[80vh] md:min-h-screen">

            {/* Background massive typography */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 0.03 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute bottom-10 text-[8rem] md:text-[16rem] lg:text-[20rem] font-serif font-black text-alpine-navy dark:text-alpine-snow whitespace-nowrap pointer-events-none select-none z-0"
            >
                PROVISIONS
            </motion.div>

            <div className="w-full max-w-[1600px] mx-auto relative z-10 mb-16 md:mb-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-24 gap-6 md:gap-8">
                    <div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-alpine-blue dark:text-alpine-sunrise text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-3"
                        >
                            Summit Gear
                        </motion.p>
                        <motion.h2
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-serif text-alpine-navy dark:text-alpine-snow"
                        >
                            The Equipment
                        </motion.h2>
                        <p className="text-alpine-navy/60 dark:text-alpine-snow/60 mt-3 md:mt-4 text-base md:text-xl max-w-md">Engineered for the extremes. Worn by the best.</p>
                    </div>

                    <Link to="/shop" className="group flex items-center gap-3">
                        <span className="text-sm md:text-base font-medium text-alpine-navy dark:text-alpine-snow group-hover:text-alpine-blue dark:group-hover:text-alpine-sunrise transition-colors">Browse All</span>
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-alpine-blue dark:bg-alpine-sunrise text-white flex items-center justify-center hover:scale-110 transition-all shadow-[0_0_30px_rgba(74,106,140,0.3)] dark:shadow-[0_0_30px_rgba(226,160,113,0.3)] group-hover:shadow-[0_0_40px_rgba(74,106,140,0.5)] dark:group-hover:shadow-[0_0_40px_rgba(226,160,113,0.5)]">
                            <ShoppingBag size={20} />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Mobile: Horizontal scrollable product cards */}
            <div className="md:hidden w-full relative z-20">
                <div ref={scrollRef} className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-6 px-2">
                    {PRODUCTS.map((product) => (
                        <div key={product.id} className="min-w-[240px] snap-start flex-shrink-0">
                            <TiltCard className="premium-card-light dark:premium-card rounded-2xl overflow-hidden border border-black/5 dark:border-white/[0.06] h-full shadow-lg group-hover:shadow-2xl">
                                <div className="relative h-52 overflow-hidden">
                                    <img src={product.img} alt={product.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-alpine-navy dark:text-alpine-snow backdrop-blur-sm z-10">
                                        {product.category}
                                    </div>
                                    {isLoggedIn && (
                                        <button
                                            onClick={(e) => toggleWishlist(String(product.id), e)}
                                            className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-sm z-10 ${
                                                wishlist.includes(String(product.id))
                                                    ? 'bg-red-500 text-white scale-110'
                                                    : 'bg-white/80 dark:bg-black/50 text-alpine-navy/50 dark:text-white/50 hover:text-red-500 hover:scale-110'
                                            }`}
                                        >
                                            <Heart size={16} className={wishlist.includes(String(product.id)) ? 'fill-current' : ''} />
                                        </button>
                                    )}
                                </div>
                                <div className="p-4 bg-alpine-snow dark:bg-black translate-z-10 relative">
                                    <h3 className="font-serif text-base text-alpine-navy dark:text-alpine-snow mb-1">{product.title}</h3>
                                    <div className="flex justify-between items-center">
                                        <span className="text-alpine-blue dark:text-alpine-sunrise font-semibold">{product.price}</span>
                                        <button className="text-xs font-bold uppercase tracking-wider text-alpine-navy/50 hover:text-alpine-navy dark:text-white/50 dark:hover:text-white transition-colors flex items-center gap-1">
                                            Details <ArrowRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            </TiltCard>
                        </div>
                    ))}
                </div>
                {/* Scroll hint dots */}
                <div className="flex justify-center gap-1.5 mt-2">
                    {PRODUCTS.map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-black/10 dark:bg-white/10" />
                    ))}
                </div>
            </div>

            {/* Desktop: 3D Cylinder / Ferris Wheel */}
            <div className="hidden md:flex relative w-full h-[550px] lg:h-[600px] perspective-[1500px] items-center justify-center z-20">
                <motion.div
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{ rotateY }}
                    className="relative w-72 h-96 transform-style-3d cursor-grab active:cursor-grabbing"
                    drag="x"
                    onDrag={(_: any, info: any) => rotateY.set(rotateY.get() + info.delta.x * 0.5)}
                >
                    {PRODUCTS.map((product, i) => {
                        const currentAngle = angleSlice * i;
                        return (
                            <TiltCard
                                key={product.id}
                                className="absolute inset-0 bg-white dark:bg-black/80 rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden transform-style-3d group"
                                style={{ transform: `rotateY(${currentAngle}deg) translateZ(${zRadius}px)` }}
                            >
                                <img src={product.img} alt={product.title} className="w-full h-2/3 object-cover opacity-90 group-hover:opacity-100 transition-opacity translate-z-10" />
                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/90 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-alpine-navy dark:text-alpine-snow backdrop-blur-sm z-10 translate-z-10">
                                    {product.category}
                                </div>
                                {isLoggedIn && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleWishlist(String(product.id), e); }}
                                        className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-lg z-20 translate-z-10 ${
                                            wishlist.includes(String(product.id))
                                                ? 'bg-red-500 text-white scale-110'
                                                : 'bg-white/80 dark:bg-black/50 text-alpine-navy/50 dark:text-white/50 hover:text-red-500 hover:scale-110'
                                        }`}
                                    >
                                        <Heart size={18} className={wishlist.includes(String(product.id)) ? 'fill-current' : ''} />
                                    </button>
                                )}
                                <div className="p-5 md:p-6 h-1/3 flex flex-col justify-between bg-alpine-snow dark:bg-black relative translate-z-10">
                                    <h3 className="font-serif text-lg md:text-xl text-alpine-navy dark:text-alpine-snow">{product.title}</h3>
                                    <div className="flex justify-between items-center w-full">
                                        <span className="text-alpine-blue dark:text-alpine-sunrise font-medium text-base md:text-lg">{product.price}</span>
                                        <button className="text-sm font-bold uppercase tracking-wider text-alpine-navy/50 hover:text-alpine-navy dark:text-white/50 dark:hover:text-white transition-colors">Details</button>
                                    </div>
                                </div>
                            </TiltCard>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};
