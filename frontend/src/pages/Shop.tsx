import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingBag, Filter, ArrowRight, X, Plus, Minus, Trash2, 
    Search, Heart, Check, ShieldCheck, Truck, Sparkles, Compass, 
    CreditCard, MapPin, Eye, ChevronRight
} from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';
import { ImageWithSkeleton } from '../components/ui/Skeleton';
import { merchandiseApi, usersApi, contactApi } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';
import { CreditTitle } from '../components/ui/CreditTitle';

interface ProductItem {
    id: string | number;
    _id?: string;
    title: string;
    name?: string;
    price: string | number;
    originalPrice?: number;
    category: string;
    img: string;
    image?: string;
    badge?: string;
    description?: string;
    inStock?: boolean;
    specs?: {
        weight?: string;
        materials?: string;
        temperatureRating?: string;
        certifications?: string;
    };
}

interface CartItem {
    id: string | number;
    title: string;
    price: number;
    currency: string;
    img: string;
    category: string;
    quantity: number;
}

const DEFAULT_PRODUCTS: ProductItem[] = [
    { 
        id: 1, 
        title: 'Ascent Pro 3L Hard-Shell Jacket', 
        price: 249, 
        originalPrice: 299, 
        category: 'Outerwear', 
        img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&fit=crop',
        badge: 'Summit Choice',
        description: 'Engineered for punishing 4,000m summits. Three-layer laminated membrane stops 80km/h gales and sub-zero blizzard sleet while releasing thermal vapor during intense ascents.',
        specs: {
            weight: '440g',
            materials: '3-Layer Ripstop Nylon with GORE-TEX Pro',
            temperatureRating: '-25°C to 5°C',
            certifications: 'UIAGM Field Tested'
        }
    },
    { 
        id: 2, 
        title: 'Merino Wool Thermal Base Layer', 
        price: 89, 
        originalPrice: 110, 
        category: 'Apparel', 
        img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&fit=crop',
        badge: 'Essential',
        description: 'Ultra-fine 260g/m² New Zealand merino wool naturally wicks moisture, regulates core temperature, and resists odor across multi-day alpine bivouacs.',
        specs: {
            weight: '210g',
            materials: '100% Traceable Merino Wool (18.5 Micron)',
            temperatureRating: '-15°C to 12°C',
            certifications: 'OEKO-TEX Certified'
        }
    },
    { 
        id: 3, 
        title: 'Expedition Rucksack 55L Ultra', 
        price: 189, 
        originalPrice: 220, 
        category: 'Gear', 
        img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&fit=crop',
        badge: 'Pro Tier',
        description: 'Ultralight Dyneema-reinforced expedition pack with roll-top storm seal, integrated rope strap, dual ice-axe holsters, and ergonomic lumbar load transfer.',
        specs: {
            weight: '1.05kg',
            materials: 'Dyneema Composite Fabric & Cordura 500D',
            temperatureRating: 'All Seasons',
            certifications: 'CE / UIAA Standard'
        }
    },
    { 
        id: 4, 
        title: 'Carbon Ascent Trekking Poles', 
        price: 129, 
        originalPrice: 150, 
        category: 'Gear', 
        img: 'https://images.unsplash.com/photo-1502224562085-639556652f33?q=80&w=800&fit=crop',
        badge: 'Ultralight',
        description: 'Three-section telescoping 100% high-modulus carbon fiber shafts with rapid CamLock levers, extended moisture-wicking EVA foam grips, and carbide tips.',
        specs: {
            weight: '380g (Pair)',
            materials: '100% High-Modulus Carbon Fiber & Tungsten Carbide',
            temperatureRating: 'Sub-Zero Tested',
            certifications: 'TÜV Rheinland Approved'
        }
    },
    { 
        id: 5, 
        title: 'Glacier Cat 4 Alpine Sunglasses', 
        price: 159, 
        originalPrice: 180, 
        category: 'Accessories', 
        img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&fit=crop',
        badge: 'Glacier Spec',
        description: 'Authentic high-altitude glacier glasses with Category 4 mineral lenses, anti-reflective coating, and genuine removable leather side shields to block snow blindness.',
        specs: {
            weight: '48g',
            materials: 'Mineral Glass & Matte Polymer with Leather Shields',
            temperatureRating: 'UV400 / 100% High-Altitude Glare',
            certifications: 'ISO 12312-1 Cat 4'
        }
    },
    { 
        id: 6, 
        title: 'Thermal Summit Technical Gloves', 
        price: 59, 
        originalPrice: 75, 
        category: 'Accessories', 
        img: 'https://images.unsplash.com/photo-1515951806792-63ac4250f2f3?q=80&w=800&fit=crop',
        description: 'Primaloft Gold insulated goatskin leather workhorse gloves. Waterproof and breathable GORE-TEX insert with reinforced palms for aggressive rope and ice tool handling.',
        specs: {
            weight: '160g',
            materials: 'Waterproof Goatskin & Primaloft Gold 133g',
            temperatureRating: '-20°C to 0°C',
            certifications: 'EN 511 Cold Resistance'
        }
    },
];

const CATEGORIES = ['All', 'Outerwear', 'Apparel', 'Gear', 'Accessories'];

export const ShopPage = () => {
    const { isLoggedIn } = useAuthStore();
    const [products, setProducts] = useState<ProductItem[]>(DEFAULT_PRODUCTS);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'featured' | 'low-high' | 'high-low'>('featured');
    
    // Cart state persisted to localStorage
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem('mountaineer-mallu-cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState<'details' | 'success'>('details');
    const [orderNumber, setOrderNumber] = useState('');

    // Wishlist
    const [wishlist, setWishlist] = useState<string[]>([]);

    // Form details for checkout
    const [checkoutForm, setCheckoutForm] = useState({
        fullName: '',
        email: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Germany',
        paymentMethod: 'card'
    });

    // Save cart to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('mountaineer-mallu-cart', JSON.stringify(cart));
        } catch (e) {
            console.error('Failed to save cart to localStorage', e);
        }
    }, [cart]);

    // Load merchandise from backend if available
    useEffect(() => {
        const fetchMerchandise = async () => {
            try {
                setLoading(true);
                const data = await merchandiseApi.list();
                if (data && data.length > 0) {
                    const mapped: ProductItem[] = data.map((item: any) => ({
                        id: item._id,
                        _id: item._id,
                        title: item.name,
                        price: item.price,
                        originalPrice: item.originalPrice,
                        category: item.category || 'Gear',
                        img: item.image,
                        badge: item.badge,
                        description: item.description,
                        inStock: item.inStock !== false,
                        specs: {
                            weight: 'Alpine Standard',
                            materials: 'Technical Mountain Grade',
                            temperatureRating: 'All Seasons',
                            certifications: 'Field Verified'
                        }
                    }));
                    setProducts(mapped);
                }
            } catch (err) {
                // Keep default products
            } finally {
                setLoading(false);
            }
        };

        fetchMerchandise();
    }, []);

    // Load wishlist
    useEffect(() => {
        if (isLoggedIn) {
            usersApi.getWishlist().then(res => {
                setWishlist((res.wishlist || []).map((w: any) => typeof w === 'string' ? w : w._id));
            }).catch(() => {});
        }
    }, [isLoggedIn]);

    // Filter & Sort
    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (selectedCategory !== 'All') {
            result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p => 
                p.title.toLowerCase().includes(query) || 
                (p.description && p.description.toLowerCase().includes(query)) ||
                p.category.toLowerCase().includes(query)
            );
        }

        if (sortBy === 'low-high') {
            result.sort((a, b) => {
                const priceA = typeof a.price === 'number' ? a.price : parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
                const priceB = typeof b.price === 'number' ? b.price : parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;
                return priceA - priceB;
            });
        } else if (sortBy === 'high-low') {
            result.sort((a, b) => {
                const priceA = typeof a.price === 'number' ? a.price : parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
                const priceB = typeof b.price === 'number' ? b.price : parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;
                return priceB - priceA;
            });
        }

        return result;
    }, [products, selectedCategory, searchQuery, sortBy]);

    // Cart operations
    const addToCart = (product: ProductItem) => {
        const numPrice = typeof product.price === 'number' 
            ? product.price 
            : parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 99;

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => 
                    item.id === product.id 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                );
            } else {
                return [...prev, {
                    id: product.id,
                    title: product.title,
                    price: numPrice,
                    currency: '€',
                    img: product.img,
                    category: product.category,
                    quantity: 1
                }];
            }
        });

        toast.success(`Stowed in Rucksack`, {
            description: `${product.title} has been added to your expedition inventory.`,
            duration: 3000
        });
    };

    const updateQuantity = (id: string | number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
        }).filter(Boolean) as CartItem[]);
    };

    const removeFromCart = (id: string | number) => {
        setCart(prev => prev.filter(item => item.id !== id));
        toast.info('Item removed from rucksack');
    };

    const clearCart = () => {
        setCart([]);
        toast.info('Rucksack emptied');
    };

    const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingCost = cartSubtotal >= 150 || cartSubtotal === 0 ? 0 : 15;
    const memberDiscount = Math.round(cartSubtotal * 0.05); // 5% community member concession
    const grandTotal = Math.max(0, cartSubtotal - memberDiscount + (cartSubtotal > 0 ? shippingCost : 0));

    const toggleWishlist = async (productId: string | number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            toast.error('Authentication Required', {
                description: 'Please sign in to save gear to your alpine wishlist.'
            });
            return;
        }

        const idStr = String(productId);
        const inWishlist = wishlist.includes(idStr);
        setWishlist(prev => inWishlist ? prev.filter(id => id !== idStr) : [...prev, idStr]);

        try {
            await usersApi.toggleWishlist(idStr);
            toast.success(inWishlist ? 'Removed from Wishlist' : 'Saved to Expedition Wishlist');
        } catch {
            setWishlist(prev => inWishlist ? [...prev, idStr] : prev.filter(id => id !== idStr));
        }
    };

    // No payment provider is connected yet, so checkout sends the complete order to the team as an order
    // request (stored and emailed by the contact endpoint); they reply with payment details. Nothing is charged.
    const [placingOrder, setPlacingOrder] = useState(false);
    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkoutForm.fullName || !checkoutForm.email || !checkoutForm.address) {
            toast.error('Please complete required shipping fields.');
            return;
        }

        const reference = `MM-ALPS-${Math.floor(100000 + Math.random() * 900000)}`;
        const lines = cart.map(item => `- ${item.quantity} × ${item.title} @ €${item.price} = €${item.price * item.quantity}`);
        const message = [
            `Order request ${reference}`,
            '',
            ...lines,
            '',
            `Subtotal: €${cartSubtotal}`,
            `Member discount: -€${memberDiscount}`,
            `Shipping: €${cartSubtotal > 0 ? shippingCost : 0}`,
            `Total: €${grandTotal}`,
            '',
            `Ship to: ${checkoutForm.fullName}, ${checkoutForm.address}, ${checkoutForm.postalCode} ${checkoutForm.city}, ${checkoutForm.country}`,
            `Preferred payment: ${checkoutForm.paymentMethod === 'card' ? 'Card (payment link by email)' : 'Pay at basecamp pickup'}`,
        ].join('\n');

        setPlacingOrder(true);
        try {
            await contactApi.submit({ name: checkoutForm.fullName, email: checkoutForm.email, subject: `Shop order request ${reference}`, message });
            setOrderNumber(reference);
            setCheckoutStep('success');
            setCart([]);
        } catch {
            // Keep the cart so nothing is lost
            toast.error("We couldn't send your order request. Please check your connection and try again.");
        } finally {
            setPlacingOrder(false);
        }
    };

    return (
        <div className="min-h-screen bg-alpine-snow dark:bg-black/95 text-alpine-navy dark:text-alpine-snow pt-32 pb-24 px-6 md:px-12 relative overflow-hidden">
            {/* Ambient Background Aura */}
            <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-alpine-blue/5 dark:bg-alpine-sunrise/5 rounded-full blur-[140px] pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto">
                <BackButton backTo="/" />

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8 border-b border-black/10 dark:border-white/10 pb-10">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, type: "spring" }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-alpine-blue/10 dark:bg-alpine-sunrise/10 text-alpine-blue dark:text-alpine-sunrise text-xs font-bold tracking-widest uppercase mb-4">
                            <Compass size={14} /> Official Alpine Equipment
                        </div>
                        <CreditTitle lines={['Provisions']} creditClassName="text-alpine-blue dark:text-alpine-sunrise" className="text-5xl md:text-8xl font-serif font-normal tracking-tight" />
                        <p className="text-lg md:text-2xl font-light text-alpine-navy/70 dark:text-alpine-snow/70 max-w-2xl leading-relaxed">
                            UIAGM-grade alpine hardware and technical weather-armor tested on Europe's most unforgiving ridges.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex flex-wrap items-center gap-4 w-full md:w-auto"
                    >
                        {/* Rucksack Button */}
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="relative flex items-center gap-3 px-7 py-3.5 bg-alpine-blue dark:bg-alpine-sunrise text-white rounded-full font-bold shadow-[0_10px_25px_rgba(74,106,140,0.3)] dark:shadow-[0_10px_25px_rgba(226,160,113,0.3)] hover:scale-105 active:scale-95 transition-all duration-300"
                        >
                            <ShoppingBag size={20} />
                            <span>Rucksack</span>
                            <span className="w-6 h-6 rounded-full bg-white text-alpine-navy font-black text-xs flex items-center justify-center shadow-inner">
                                {totalCartCount}
                            </span>
                        </button>
                    </motion.div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 mb-12 bg-white/40 dark:bg-white/[0.03] backdrop-blur-md p-4 rounded-3xl border border-black/5 dark:border-white/10 shadow-sm">
                    {/* Categories Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                                    selectedCategory === cat
                                        ? 'bg-alpine-navy text-white dark:bg-white dark:text-black shadow-md scale-105'
                                        : 'bg-black/5 dark:bg-white/5 text-alpine-navy/70 dark:text-alpine-snow/70 hover:bg-black/10 dark:hover:bg-white/10'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Search & Sort Controls */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        {/* Search Input */}
                        <div className="relative min-w-[240px]">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-alpine-navy/40 dark:text-alpine-snow/40" />
                            <input
                                type="text"
                                placeholder="Search gear or specs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white/70 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-full text-sm outline-none focus:border-alpine-blue dark:focus:border-alpine-sunrise transition-colors"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-alpine-navy/40 dark:text-alpine-snow/40 hover:text-alpine-navy dark:hover:text-white"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Sort Selector */}
                        <div className="flex items-center gap-2 text-xs font-semibold">
                            <span className="text-alpine-navy/50 dark:text-alpine-snow/50 uppercase tracking-wider">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-white/70 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-full px-4 py-2.5 text-xs font-bold outline-none cursor-pointer"
                            >
                                <option value="featured">Featured Ascent</option>
                                <option value="low-high">Price: Low to High</option>
                                <option value="high-low">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Product Count Indicator */}
                <div className="flex justify-between items-center mb-8 px-2 text-xs uppercase font-bold tracking-widest text-alpine-navy/50 dark:text-alpine-snow/50">
                    <span>Showing {filteredProducts.length} Technical Provisions</span>
                    <span className="flex items-center gap-2">
                        <Truck size={14} className="text-alpine-blue dark:text-alpine-sunrise" /> 
                        Free Alpine Delivery over €150
                    </span>
                </div>

                {/* Product Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-24 glass-dark rounded-3xl border border-black/5 dark:border-white/10 my-8">
                        <Compass className="w-16 h-16 mx-auto mb-4 text-alpine-navy/30 dark:text-white/30 animate-spin-slow" />
                        <h3 className="text-2xl font-serif font-bold mb-2">No Provisions Matched Your Query</h3>
                        <p className="text-alpine-navy/60 dark:text-alpine-snow/60 text-sm max-w-md mx-auto mb-6">
                            Try adjusting your search criteria or explore other technical gear categories.
                        </p>
                        <button
                            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                            className="px-6 py-2.5 bg-alpine-blue dark:bg-alpine-sunrise text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all"
                        >
                            Reset Provisions Filter
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-16">
                        {filteredProducts.map((product, i) => {
                            const numPrice = typeof product.price === 'number' ? product.price : parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0;
                            const isLiked = wishlist.includes(String(product.id));

                            return (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-40px" }}
                                    transition={{ duration: 0.6, delay: (i % 3) * 0.1, type: 'spring' }}
                                    className="group flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Image Container Card */}
                                        <div className="aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden mb-6 relative bg-white/40 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 shadow-lg group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-700">
                                            <ImageWithSkeleton
                                                src={product.img}
                                                alt={product.title}
                                                containerClassName="w-full h-full"
                                                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-1000 ease-out"
                                            />

                                            {/* Badge */}
                                            {product.badge && (
                                                <div className="absolute top-5 left-5 bg-alpine-blue/90 dark:bg-alpine-sunrise/90 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                                                    {product.badge}
                                                </div>
                                            )}

                                            {/* Wishlist Heart */}
                                            <button
                                                onClick={(e) => toggleWishlist(product.id, e)}
                                                className={`absolute top-5 right-5 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-md ${
                                                    isLiked 
                                                        ? 'bg-red-500 text-white scale-110' 
                                                        : 'bg-white/80 dark:bg-black/60 text-alpine-navy/60 dark:text-alpine-snow/60 hover:text-red-500 hover:scale-110'
                                                }`}
                                                aria-label="Save to Wishlist"
                                            >
                                                <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                                            </button>

                                            {/* Quick View Button */}
                                            <button
                                                onClick={() => setQuickViewProduct(product)}
                                                className="absolute bottom-20 right-5 w-10 h-10 rounded-full bg-white/80 dark:bg-black/70 backdrop-blur-md flex items-center justify-center text-alpine-navy dark:text-alpine-snow opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-md hover:scale-110"
                                                title="Technical Specs"
                                            >
                                                <Eye size={18} />
                                            </button>

                                            {/* Hover "Add to Rucksack" Bar */}
                                            <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-3 group-hover:translate-y-0">
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    className="w-full py-4 bg-white/20 hover:bg-white text-white hover:text-alpine-navy backdrop-blur-md rounded-2xl font-bold tracking-widest uppercase text-xs border border-white/30 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl active:scale-98"
                                                >
                                                    <ShoppingBag size={16} /> Add to Rucksack
                                                </button>
                                            </div>

                                            {/* Category Tag */}
                                            <div className="absolute bottom-5 left-5 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-alpine-navy dark:text-alpine-snow shadow-sm border border-black/5 dark:border-white/10 group-hover:opacity-0 transition-opacity">
                                                {product.category}
                                            </div>
                                        </div>

                                        {/* Product Details Header */}
                                        <div className="px-2">
                                            <div className="flex justify-between items-start gap-4 mb-2">
                                                <h3 
                                                    onClick={() => setQuickViewProduct(product)}
                                                    className="font-serif text-2xl font-bold cursor-pointer group-hover:text-alpine-blue dark:group-hover:text-alpine-sunrise transition-colors line-clamp-1"
                                                >
                                                    {product.title}
                                                </h3>
                                                <div className="text-right flex-shrink-0">
                                                    <span className="text-2xl font-serif font-black text-alpine-blue dark:text-alpine-sunrise">
                                                        €{numPrice}
                                                    </span>
                                                    {product.originalPrice && (
                                                        <span className="block text-xs line-through text-alpine-navy/40 dark:text-alpine-snow/40 font-mono">
                                                            €{product.originalPrice}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-alpine-navy/60 dark:text-alpine-snow/60 line-clamp-2 leading-relaxed mb-4 font-light">
                                                {product.description || 'Tested in the Swiss Alps for maximum performance and extreme endurance.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Footnote */}
                                    <div className="px-2 pt-2 flex items-center justify-between border-t border-black/5 dark:border-white/5">
                                        <button
                                            onClick={() => setQuickViewProduct(product)}
                                            className="text-xs font-semibold uppercase tracking-wider text-alpine-navy/60 dark:text-alpine-snow/60 hover:text-alpine-navy dark:hover:text-white flex items-center gap-1 group/btn transition-colors"
                                        >
                                            Inspect Specs <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                            <Check size={12} /> Ready to ship
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ─── Slide-over Rucksack Drawer ─────────────────────────── */}
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCartOpen(false)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
                        />

                        {/* Drawer Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-lg bg-alpine-snow dark:bg-[#07090E] border-l border-black/10 dark:border-white/10 z-[101] shadow-2xl flex flex-col justify-between"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-alpine-blue dark:bg-alpine-sunrise text-white flex items-center justify-center shadow-md">
                                        <ShoppingBag size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-serif font-black">Your Rucksack</h2>
                                        <p className="text-xs text-alpine-navy/60 dark:text-alpine-snow/60 uppercase tracking-widest font-semibold">
                                            {totalCartCount} Expedition Items Selected
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Free Shipping Progress Indicator */}
                            <div className="px-6 md:px-8 py-3 bg-alpine-blue/5 dark:bg-alpine-sunrise/5 border-b border-black/5 dark:border-white/5">
                                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                                    <span>
                                        {cartSubtotal >= 150 
                                            ? '✓ Free Alpine Courier Unlocked!' 
                                            : `Add €${150 - cartSubtotal} more for Free Delivery`}
                                    </span>
                                    <span>{Math.min(100, Math.round((cartSubtotal / 150) * 100))}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-alpine-blue dark:bg-alpine-sunrise transition-all duration-500 rounded-full"
                                        style={{ width: `${Math.min(100, (cartSubtotal / 150) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Cart Item List */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
                                {cart.length === 0 ? (
                                    <div className="text-center py-20 flex flex-col items-center justify-center">
                                        <ShoppingBag size={48} className="text-alpine-navy/20 dark:text-white/20 mb-4" />
                                        <h3 className="font-serif text-xl font-bold mb-1">Your Rucksack is Empty</h3>
                                        <p className="text-xs text-alpine-navy/50 dark:text-alpine-snow/50 max-w-xs mb-6">
                                            Select technical gear from our provisions catalog to pack for your next ascent.
                                        </p>
                                        <button
                                            onClick={() => setIsCartOpen(false)}
                                            className="px-6 py-2.5 bg-alpine-navy dark:bg-white text-white dark:text-black rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all"
                                        >
                                            Explore Provisions
                                        </button>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 shadow-sm"
                                        >
                                            <img
                                                src={item.img}
                                                alt={item.title}
                                                className="w-18 h-20 rounded-xl object-cover flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-alpine-blue dark:text-alpine-sunrise block mb-0.5">
                                                    {item.category}
                                                </span>
                                                <h4 className="font-serif font-bold text-sm truncate mb-1">{item.title}</h4>
                                                <p className="text-xs font-black text-alpine-navy/80 dark:text-alpine-snow/80">
                                                    €{item.price}
                                                </p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-full">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-6 h-6 rounded-full bg-white dark:bg-black/60 flex items-center justify-center hover:scale-110 active:scale-90 transition-all text-xs"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="text-xs font-bold px-1">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-6 h-6 rounded-full bg-white dark:bg-black/60 flex items-center justify-center hover:scale-110 active:scale-90 transition-all text-xs"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>

                                            {/* Delete Item */}
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-alpine-navy/40 dark:text-alpine-snow/40 hover:text-red-500 transition-colors p-1"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Drawer Footer / Summary */}
                            {cart.length > 0 && (
                                <div className="p-6 md:p-8 bg-white/70 dark:bg-black/40 border-t border-black/10 dark:border-white/10 space-y-4">
                                    <div className="space-y-2 text-xs font-semibold">
                                        <div className="flex justify-between text-alpine-navy/70 dark:text-alpine-snow/70">
                                            <span>Subtotal</span>
                                            <span>€{cartSubtotal}</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                            <span>Alpine Club Concession (5%)</span>
                                            <span>-€{memberDiscount}</span>
                                        </div>
                                        <div className="flex justify-between text-alpine-navy/70 dark:text-alpine-snow/70">
                                            <span>Expedition Delivery</span>
                                            <span>{shippingCost === 0 ? 'FREE' : `€${shippingCost}`}</span>
                                        </div>
                                        <div className="h-px bg-black/10 dark:border-white/10 my-2" />
                                        <div className="flex justify-between text-lg font-serif font-black text-alpine-navy dark:text-alpine-snow">
                                            <span>Total Provision Cost</span>
                                            <span className="text-alpine-blue dark:text-alpine-sunrise">€{grandTotal}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={clearCart}
                                            className="px-4 py-3.5 border border-black/10 dark:border-white/10 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                        >
                                            Clear
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsCartOpen(false);
                                                setIsCheckoutOpen(true);
                                            }}
                                            className="flex-1 py-4 bg-alpine-blue dark:bg-alpine-sunrise text-white rounded-2xl font-bold tracking-widest uppercase text-xs shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                        >
                                            Proceed to Dispatch <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ─── Quick View Technical Specifications Modal ─────────────── */}
            <AnimatePresence>
                {quickViewProduct && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setQuickViewProduct(null)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120]"
                        />
                        <div className="fixed inset-0 z-[121] flex items-center justify-center p-4 md:p-8 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: "spring", damping: 25 }}
                                className="w-full max-w-4xl bg-alpine-snow dark:bg-[#0B0D14] border border-black/10 dark:border-white/15 rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col md:flex-row max-h-[90vh]"
                            >
                                {/* Modal Visual */}
                                <div className="md:w-1/2 relative bg-black/40 min-h-[300px] md:min-h-full">
                                    <img
                                        src={quickViewProduct.img}
                                        alt={quickViewProduct.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    {quickViewProduct.badge && (
                                        <div className="absolute top-6 left-6 bg-alpine-blue dark:bg-alpine-sunrise text-white text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg">
                                            {quickViewProduct.badge}
                                        </div>
                                    )}
                                </div>

                                {/* Modal Content */}
                                <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-between overflow-y-auto">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-xs font-bold uppercase tracking-widest text-alpine-blue dark:text-alpine-sunrise">
                                                {quickViewProduct.category}
                                            </span>
                                            <button
                                                onClick={() => setQuickViewProduct(null)}
                                                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:scale-110 transition-transform"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>

                                        <h2 className="text-3xl font-serif font-normal mb-3">{quickViewProduct.title}</h2>
                                        <div className="flex items-baseline gap-3 mb-6">
                                            <span className="text-3xl font-serif font-normal text-alpine-blue dark:text-alpine-sunrise">
                                                €{typeof quickViewProduct.price === 'number' ? quickViewProduct.price : quickViewProduct.price}
                                            </span>
                                            {quickViewProduct.originalPrice && (
                                                <span className="text-sm line-through text-alpine-navy/40 dark:text-alpine-snow/40 font-mono">
                                                    €{quickViewProduct.originalPrice}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-alpine-navy/70 dark:text-alpine-snow/70 leading-relaxed mb-8 font-light">
                                            {quickViewProduct.description}
                                        </p>

                                        {/* Technical Specifications Matrix */}
                                        <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-5 mb-8 space-y-3 text-xs">
                                            <h4 className="font-bold uppercase tracking-widest text-[10px] text-alpine-navy/40 dark:text-alpine-snow/40 mb-2">
                                                Technical Specifications
                                            </h4>
                                            <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-2">
                                                <span className="text-alpine-navy/60 dark:text-alpine-snow/60">Pack Weight</span>
                                                <span className="font-bold">{quickViewProduct.specs?.weight || '380g'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-2">
                                                <span className="text-alpine-navy/60 dark:text-alpine-snow/60">Construction</span>
                                                <span className="font-bold truncate max-w-[200px] text-right">{quickViewProduct.specs?.materials || 'Alpine Composite'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-2">
                                                <span className="text-alpine-navy/60 dark:text-alpine-snow/60">Thermal Envelope</span>
                                                <span className="font-bold">{quickViewProduct.specs?.temperatureRating || '-15°C to 10°C'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-alpine-navy/60 dark:text-alpine-snow/60">Certification</span>
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{quickViewProduct.specs?.certifications || 'CE / UIAA Certified'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Foot */}
                                    <div className="flex gap-4 pt-4 border-t border-black/10 dark:border-white/10">
                                        <button
                                            onClick={() => {
                                                addToCart(quickViewProduct);
                                                setQuickViewProduct(null);
                                            }}
                                            className="flex-1 py-4 bg-alpine-blue dark:bg-alpine-sunrise text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
                                        >
                                            <ShoppingBag size={18} /> Add to Rucksack
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* ─── Checkout Expedition Dispatch Modal ─────────────────── */}
            <AnimatePresence>
                {isCheckoutOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[130]"
                        />
                        <div className="fixed inset-0 z-[131] flex items-center justify-center p-4 md:p-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                className="w-full max-w-2xl bg-alpine-snow dark:bg-[#090C12] border border-black/10 dark:border-white/15 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-y-auto max-h-[95vh]"
                            >
                                {checkoutStep === 'details' ? (
                                    <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-6">
                                            <div>
                                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-alpine-blue dark:text-alpine-sunrise mb-1">
                                                    <Truck size={14} /> Expedition Logistics
                                                </div>
                                                <h2 className="text-3xl font-serif font-normal">Your bag</h2>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsCheckoutOpen(false)}
                                                className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:scale-110 transition-transform"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>

                                        {/* Order Preview Mini Bar */}
                                        <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs font-bold">
                                            <span>Inventory Payload: {totalCartCount} items</span>
                                            <span className="text-alpine-blue dark:text-alpine-sunrise font-serif text-base">Total: €{grandTotal}</span>
                                        </div>

                                        {/* Contact Fields */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-alpine-navy/60 dark:text-alpine-snow/60 mb-2">Climber Full Name *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={checkoutForm.fullName}
                                                    onChange={e => setCheckoutForm({ ...checkoutForm, fullName: e.target.value })}
                                                    placeholder="e.g. Arun Nair"
                                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 text-sm outline-none focus:border-alpine-blue dark:focus:border-alpine-sunrise"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-alpine-navy/60 dark:text-alpine-snow/60 mb-2">Email *</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={checkoutForm.email}
                                                    onChange={e => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                                                    placeholder="arun@example.com"
                                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 text-sm outline-none focus:border-alpine-blue dark:focus:border-alpine-sunrise"
                                                />
                                            </div>
                                        </div>

                                        {/* Address Fields */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-alpine-navy/60 dark:text-alpine-snow/60 mb-2">Delivery Hut / Street Address *</label>
                                            <input
                                                type="text"
                                                required
                                                value={checkoutForm.address}
                                                onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                                                placeholder="Alpenweg 14 or Basecamp Office"
                                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 text-sm outline-none focus:border-alpine-blue dark:focus:border-alpine-sunrise"
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-1">
                                                <label className="block text-xs font-bold uppercase tracking-wider text-alpine-navy/60 dark:text-alpine-snow/60 mb-2">City</label>
                                                <input
                                                    type="text"
                                                    value={checkoutForm.city}
                                                    onChange={e => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                                                    placeholder="Munich"
                                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 text-sm outline-none focus:border-alpine-blue dark:focus:border-alpine-sunrise"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-xs font-bold uppercase tracking-wider text-alpine-navy/60 dark:text-alpine-snow/60 mb-2">Postal Code</label>
                                                <input
                                                    type="text"
                                                    value={checkoutForm.postalCode}
                                                    onChange={e => setCheckoutForm({ ...checkoutForm, postalCode: e.target.value })}
                                                    placeholder="80331"
                                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 text-sm outline-none focus:border-alpine-blue dark:focus:border-alpine-sunrise"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-xs font-bold uppercase tracking-wider text-alpine-navy/60 dark:text-alpine-snow/60 mb-2">Country</label>
                                                <select
                                                    value={checkoutForm.country}
                                                    onChange={e => setCheckoutForm({ ...checkoutForm, country: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 text-sm outline-none"
                                                >
                                                    <option>Germany</option>
                                                    <option>Switzerland</option>
                                                    <option>Austria</option>
                                                    <option>France</option>
                                                    <option>Italy</option>
                                                    <option>United Kingdom</option>
                                                    <option>India</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Payment Selection Simulator */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-alpine-navy/60 dark:text-alpine-snow/60 mb-2">Settlement Channel</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div 
                                                    onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'card' })}
                                                    className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                                                        checkoutForm.paymentMethod === 'card' 
                                                            ? 'border-alpine-blue dark:border-alpine-sunrise bg-alpine-blue/5 dark:bg-alpine-sunrise/5 shadow-sm' 
                                                            : 'border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.02]'
                                                    }`}
                                                >
                                                    <CreditCard size={20} className="text-alpine-blue dark:text-alpine-sunrise" />
                                                    <div>
                                                        <p className="text-xs font-bold">Credit / Debit Card</p>
                                                        <p className="text-[10px] text-alpine-navy/50 dark:text-alpine-snow/50">Secure payment link by email</p>
                                                    </div>
                                                </div>

                                                <div 
                                                    onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'basecamp' })}
                                                    className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                                                        checkoutForm.paymentMethod === 'basecamp' 
                                                            ? 'border-alpine-blue dark:border-alpine-sunrise bg-alpine-blue/5 dark:bg-alpine-sunrise/5 shadow-sm' 
                                                            : 'border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.02]'
                                                    }`}
                                                >
                                                    <MapPin size={20} className="text-alpine-blue dark:text-alpine-sunrise" />
                                                    <div>
                                                        <p className="text-xs font-bold">Basecamp Settlement</p>
                                                        <p className="text-[10px] text-alpine-navy/50 dark:text-alpine-snow/50">Pay on Expedition Pickup</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-[11px] text-alpine-navy/55 dark:text-alpine-snow/55 text-center -mb-1">
                                            Nothing is charged now — we confirm availability and email you payment details.
                                        </p>
                                        <button
                                            type="submit"
                                            disabled={placingOrder}
                                            className="disabled:opacity-60 disabled:cursor-wait w-full py-4 bg-alpine-blue dark:bg-alpine-sunrise text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
                                        >
                                            <ShieldCheck size={18} /> {placingOrder ? 'Sending order request…' : `Send order request (€${grandTotal})`}
                                        </button>
                                    </form>
                                ) : (
                                    /* Order Success View */
                                    <div className="text-center py-6 space-y-6">
                                        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                            <Check size={40} className="animate-scale-up" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-alpine-blue dark:text-alpine-sunrise">
                                                Expedition Manifest Transmitted
                                            </span>
                                            <h2 className="text-3xl font-serif font-normal mt-1 mb-2">Order request received</h2>
                                            <p className="text-sm text-alpine-navy/70 dark:text-alpine-snow/70 max-w-md mx-auto leading-relaxed">
                                                The team has your order. We'll confirm availability and send payment and delivery details to <strong className="text-alpine-navy dark:text-white">{checkoutForm.email}</strong>. Nothing has been charged yet.
                                            </p>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 max-w-md mx-auto text-left space-y-2 text-xs">
                                            <div className="flex justify-between pb-2 border-b border-black/5 dark:border-white/5">
                                                <span className="text-alpine-navy/60 dark:text-alpine-snow/60">Order reference</span>
                                                <span className="font-mono font-bold text-alpine-blue dark:text-alpine-sunrise">{orderNumber}</span>
                                            </div>
                                            <div className="flex justify-between pb-2 border-b border-black/5 dark:border-white/5">
                                                <span className="text-alpine-navy/60 dark:text-alpine-snow/60">Recipient</span>
                                                <span className="font-bold">{checkoutForm.fullName}</span>
                                            </div>
                                            <div className="flex justify-between pb-2 border-b border-black/5 dark:border-white/5">
                                                <span className="text-alpine-navy/60 dark:text-alpine-snow/60">Estimated Arrival</span>
                                                <span className="font-bold">2 - 3 Alpine Working Days</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-alpine-navy/60 dark:text-alpine-snow/60">Settlement Total</span>
                                                <span className="font-bold">€{grandTotal}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setIsCheckoutOpen(false);
                                                setCheckoutStep('details');
                                            }}
                                            className="px-8 py-3.5 bg-alpine-blue dark:bg-alpine-sunrise text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                                        >
                                            Return to Mountain Provisions
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
