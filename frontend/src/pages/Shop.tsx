import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Filter, ArrowRight } from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';

const PRODUCTS = [
    { id: 1, title: 'Ascent Pro Jacket', price: '€249', category: 'Outerwear', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&fit=crop' },
    { id: 2, title: 'Merino Base Layer', price: '€89', category: 'Apparel', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&fit=crop' },
    { id: 3, title: 'Expedition Pack 45L', price: '€189', category: 'Gear', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&fit=crop' },
    { id: 4, title: 'Carbon Trek Poles', price: '€129', category: 'Gear', img: 'https://images.unsplash.com/photo-1502224562085-639556652f33?q=80&w=800&fit=crop' },
    { id: 5, title: 'Alpine Sunglasses', price: '€159', category: 'Accessories', img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&fit=crop' },
    { id: 6, title: 'Thermal Gloves', price: '€59', category: 'Accessories', img: 'https://images.unsplash.com/photo-1515234558509-0d3dbcf0fbab?q=80&w=800&fit=crop' },
];

export const ShopPage = () => {
    return (
        <div className="min-h-screen bg-alpine-snow dark:bg-black/95 text-alpine-navy dark:text-alpine-snow pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                <BackButton />

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, type: "spring" }}
                    >
                        <h1 className="text-6xl md:text-8xl font-serif font-black mb-4">Provisions</h1>
                        <p className="text-xl md:text-2xl font-light text-alpine-navy/60 dark:text-alpine-snow/60">
                            Premium gear tested by our core team. Built for the most unforgiving environments.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="flex gap-4"
                    >
                        <button className="flex items-center gap-2 px-6 py-3 border border-black/20 dark:border-white/20 rounded-full font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            <Filter size={18} /> Filters
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-alpine-blue dark:bg-alpine-sunrise text-white rounded-full font-medium hover:scale-105 transition-transform shadow-lg">
                            <ShoppingBag size={18} /> Cart (0)
                        </button>
                    </motion.div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-16">
                    {PRODUCTS.map((product, i) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 100 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: i * 0.1, type: 'spring' }}
                            className="group cursor-pointer"
                        >
                            <div className="aspect-[3/4] w-full rounded-[2rem] overflow-hidden mb-6 relative bg-white/50 dark:bg-black/50 border border-black/5 dark:border-white/10 shadow-lg group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transition-all duration-500">
                                <img src={product.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />

                                {/* Hover Overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                                    <button className="w-full py-4 bg-white/20 backdrop-blur-md rounded-xl text-white font-bold tracking-widest uppercase text-sm border border-white/30 hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2">
                                        Add to Rucksack <ShoppingBag size={16} />
                                    </button>
                                </div>

                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-alpine-navy dark:text-alpine-snow shadow-sm border border-black/5 dark:border-white/10">
                                    {product.category}
                                </div>
                            </div>

                            <div className="flex justify-between items-start px-2">
                                <div>
                                    <h3 className="font-serif text-2xl mb-1 group-hover:text-alpine-blue dark:group-hover:text-alpine-sunrise transition-colors">{product.title}</h3>
                                </div>
                                <div className="text-xl font-medium text-alpine-blue dark:text-alpine-sunrise">
                                    {product.price}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </div>
    );
};
