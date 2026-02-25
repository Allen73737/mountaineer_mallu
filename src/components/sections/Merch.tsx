import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const PRODUCTS = [
    { id: 1, title: 'Ascent Pro Jacket', price: '€249', category: 'Outerwear', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&h=800&fit=crop' },
    { id: 2, title: 'Merino Base Layer', price: '€89', category: 'Apparel', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&h=800&fit=crop' },
    { id: 3, title: 'Expedition Pack 45L', price: '€189', category: 'Gear', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&h=800&fit=crop' },
    { id: 4, title: 'Carbon Trek Poles', price: '€129', category: 'Gear', img: 'https://images.unsplash.com/photo-1502224562085-639556652f33?q=80&w=600&h=800&fit=crop' },
    { id: 5, title: 'Alpine Sunglasses', price: '€159', category: 'Accessories', img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&h=800&fit=crop' }
];

export const Merch = () => {
    const [rotation, setRotation] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Auto-rotate the Ferris wheel cylinder
    useEffect(() => {
        if (isHovered) return;
        const interval = setInterval(() => {
            setRotation(prev => prev - 0.5); // Constant slow rotation
        }, 30);
        return () => clearInterval(interval);
    }, [isHovered]);

    // Number of items dictates the angle slice
    const angleSlice = 360 / PRODUCTS.length;
    // Calculate a radius that fits all items side-by-side using basic trig
    // item width (~300px) / (2 * tan(PI/n)) roughly
    const zRadius = 400;

    return (
        <section id="merch" className="py-24 px-6 md:px-12 bg-alpine-snow dark:bg-black/95 relative overflow-hidden flex flex-col items-center justify-center min-h-screen">

            {/* Background massive typography */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 0.05 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute bottom-10 text-[10rem] md:text-[20rem] font-serif font-black text-alpine-navy dark:text-alpine-snow whitespace-nowrap pointer-events-none select-none z-0"
            >
                PROVISIONS
            </motion.div>

            <div className="max-w-7xl mx-auto relative z-10 w-full mb-32 md:mb-0">

                <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false }}
                            transition={{ duration: 1 }}
                            className="text-5xl md:text-7xl font-serif text-alpine-navy dark:text-alpine-snow"
                        >
                            The Equipment
                        </motion.h2>
                        <p className="text-alpine-navy/60 dark:text-alpine-snow/60 mt-4 text-xl">Engineered for the extremes. Worn by the best.</p>
                    </div>

                    <Link to="/shop" className="group flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-alpine-blue dark:bg-alpine-sunrise text-white flex items-center justify-center hover:scale-110 transition-all shadow-[0_0_30px_rgba(226,160,113,0.3)] group-hover:shadow-[0_0_40px_rgba(226,160,113,0.6)]">
                            <ShoppingBag size={24} />
                        </div>
                    </Link>
                </div>

            </div>

            {/* 3D Cylinder / Ferris Wheel */}
            <div className="relative w-full h-[600px] perspective-[1500px] flex items-center justify-center z-20">
                <motion.div
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    animate={{ rotateY: rotation }}
                    transition={{ ease: "linear", duration: 0 }}
                    className="relative w-72 h-96 transform-style-3d cursor-grab active:cursor-grabbing"
                    drag="x"
                    onDrag={(e: any, info: any) => setRotation(rotation + info.delta.x * 0.5)}
                >
                    {PRODUCTS.map((product, i) => {
                        const currentAngle = angleSlice * i;

                        return (
                            <div
                                key={product.id}
                                className="absolute inset-0 bg-white dark:bg-black/80 rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden transform-style-3d group"
                                // The magic of the cylinder: rotate each item to its slice angle, then push it OUT by the radius
                                style={{ transform: `rotateY(${currentAngle}deg) translateZ(${zRadius}px)` }}
                            >
                                <img
                                    src={product.img}
                                    alt={product.title}
                                    className="w-full h-2/3 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                />

                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/90 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-alpine-navy dark:text-alpine-snow backdrop-blur-sm">
                                    {product.category}
                                </div>

                                <div className="p-6 h-1/3 flex flex-col justify-between bg-alpine-snow dark:bg-black/80">
                                    <h3 className="font-serif text-xl text-alpine-navy dark:text-alpine-snow">{product.title}</h3>
                                    <div className="flex justify-between items-center w-full">
                                        <span className="text-alpine-blue dark:text-alpine-sunrise font-medium text-lg">{product.price}</span>
                                        <button className="text-sm font-bold uppercase tracking-wider text-alpine-navy/50 hover:text-alpine-navy dark:text-white/50 dark:hover:text-white transition-colors">Details</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            </div>

        </section>
    );
};
