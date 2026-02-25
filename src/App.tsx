import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { SidePanel } from './components/layout/SidePanel';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { Home } from './pages/Home';
import { StoriesPage } from './pages/Stories';
import { EventsPage } from './pages/Events';
import { GalleryPage } from './pages/Gallery';
import { TeamPage } from './pages/Team';
import { ReviewsPage } from './pages/Reviews';
import { ShopPage } from './pages/Shop';
import { ContactPage } from './pages/Contact';
import { CommunityPage } from './pages/CommunityPage';
import { useStore } from './store/useStore';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ProfileCompletion } from './pages/auth/ProfileCompletion';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AccessDenied } from './pages/admin/AccessDenied';
import { AdminManagement } from './pages/admin/AdminManagement';

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

function App() {
    const { theme } = useStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    useEffect(() => {
        if (theme !== 'system') return;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(e.matches ? 'dark' : 'light');
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Framer motion whileInView configurations need x overflow hidden for horizontal sections
    return (
        <div className="min-h-screen bg-alpine-snow dark:bg-black text-alpine-navy dark:text-alpine-snow transition-colors duration-500 overflow-x-hidden">
            <ScrollToTop />

            <AnimatePresence>
                {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
            </AnimatePresence>

            <Navbar />
            <SidePanel />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/stories" element={<StoriesPage />} />
                <Route path="/stories/:id" element={<StoriesPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventsPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/profile-complete" element={
                    <ProtectedRoute requireProfileComplete={false}>
                        <ProfileCompletion />
                    </ProtectedRoute>
                } />

                {/* Admin Dashboard Routes */}
                <Route path="/summit-control-panel" element={
                    <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }>
                    <Route index element={<AdminOverview />} />
                    <Route path="access-denied" element={<AccessDenied />} />
                    <Route path="management" element={
                        <ProtectedRoute allowedRoles={['SuperAdmin']}>
                            <AdminManagement />
                        </ProtectedRoute>
                    } />
                    <Route path="*" element={
                        <div className="flex items-center justify-center h-[60vh] text-white/50 font-mono tracking-widest text-lg">
                            [ SECTOR_UNDER_CONSTRUCTION ]
                        </div>
                    } />
                </Route>
            </Routes>
        </div>
    );
}

export default App;
