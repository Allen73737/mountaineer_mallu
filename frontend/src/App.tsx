import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { SidePanel } from './components/layout/SidePanel';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { MaintenanceBanner } from './components/ui/MaintenanceBanner';
import { ComingSoon } from './components/ui/ComingSoon';
import { CookieBanner } from './components/ui/CookieBanner';
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
import { useAuthStore } from './store/useAuthStore';
import { useSiteSettings } from './store/useSiteSettings';
import { setAuthInvalidatedCallback } from './lib/api';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ProfileCompletion } from './pages/auth/ProfileCompletion';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UserDashboard } from './pages/user/UserDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AccessDenied } from './pages/admin/AccessDenied';
import { AdminProfile } from './pages/admin/AdminProfile';
import { AdminManagement } from './pages/admin/AdminManagement';
import { StoriesManagement } from './pages/admin/StoriesManagement';
import { EventsManagement } from './pages/admin/EventsManagement';
import { AdminGallery } from './pages/admin/AdminGallery';
import { CommunityManagement } from './pages/admin/CommunityManagement';
import { UsersManagement } from './pages/admin/UsersManagement';
import { SectionSettings } from './pages/admin/SectionSettings';
import { PillarsManagement } from './pages/admin/PillarsManagement';
import { ReviewsManagement } from './pages/admin/ReviewsManagement';
import { MerchandiseManagement } from './pages/admin/MerchandiseManagement';
import { StoryDetail } from './pages/StoryDetail';
import { EventDetail } from './pages/EventDetail';
import { AIChatAssistant } from './components/ui/AIChatAssistant';

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

/** Route guard — redirects hidden sections, shows ComingSoon for coming_soon */
const SectionRoute = ({ sectionKey, label, children }: { sectionKey: string; label: string; children: React.ReactNode }) => {
    const { settings, loaded } = useSiteSettings();
    if (!loaded) return null;
    const status = settings.sections[sectionKey];
    if (status === 'hidden') return <Navigate to="/" replace />;
    if (status === 'coming_soon') return <ComingSoon sectionName={label} />;
    return <>{children}</>;
};

function App() {
    const { theme } = useStore();
    const { checkAuth, user } = useAuthStore();
    const { fetchSettings, initSocket, disconnectSocket, settings } = useSiteSettings();
    const { i18n } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/summit-control-panel');
    const isPortalRoute = location.pathname.startsWith('/portal');
    const isAuthRoute = ['/login', '/signup', '/profile-complete'].includes(location.pathname);
    const isAppLayout = !isAdminRoute && !isPortalRoute && !isAuthRoute;

    const isAdmin = user?.role === 'Admin' || user?.role === 'SuperAdmin';
    const showMaintenance = settings.maintenance.enabled && !(isAdmin && settings.maintenance.allowAdminAccess);

    // Check persistent auth on app mount (HTTP-only cookie → /api/auth/me)
    useEffect(() => {
        checkAuth();
        fetchSettings();
        initSocket();

        // Wire up auto-logout on 401 (expired/invalid session)
        setAuthInvalidatedCallback(() => {
            useAuthStore.getState().logoutAsync();
        });

        return () => disconnectSocket();
    }, []);

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

    useEffect(() => {
        document.documentElement.lang = i18n.language.split('-')[0];
    }, [i18n.language]);

    // Framer motion whileInView configurations need x overflow hidden for horizontal sections
    return (
        <div className="min-h-screen bg-alpine-snow dark:bg-black text-alpine-navy dark:text-alpine-snow transition-colors duration-500 overflow-x-hidden film-grain">
            <ScrollToTop />

            <AnimatePresence>
                {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
            </AnimatePresence>

            {/* Maintenance Banner */}
            {settings.maintenance.enabled && !isAdminRoute && (
                <MaintenanceBanner
                    message={settings.maintenance.message}
                    isAdmin={isAdmin}
                />
            )}

            {isAppLayout && (
                <>
                    <Navbar />
                    <SidePanel />
                </>
            )}

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/stories" element={<SectionRoute sectionKey="stories" label="Stories"><StoriesPage /></SectionRoute>} />
                <Route path="/stories/:id" element={<SectionRoute sectionKey="stories" label="Stories"><StoryDetail /></SectionRoute>} />
                <Route path="/events" element={<SectionRoute sectionKey="events" label="Events"><EventsPage /></SectionRoute>} />
                <Route path="/events/:id" element={<SectionRoute sectionKey="events" label="Events"><EventDetail /></SectionRoute>} />
                <Route path="/gallery" element={<SectionRoute sectionKey="gallery" label="Gallery"><GalleryPage /></SectionRoute>} />
                <Route path="/community" element={<SectionRoute sectionKey="community" label="Community"><CommunityPage /></SectionRoute>} />
                <Route path="/team" element={<SectionRoute sectionKey="team" label="Team"><TeamPage /></SectionRoute>} />
                <Route path="/reviews" element={<SectionRoute sectionKey="reviews" label="Reviews"><ReviewsPage /></SectionRoute>} />
                <Route path="/shop" element={<SectionRoute sectionKey="shop" label="Merchandise"><ShopPage /></SectionRoute>} />
                <Route path="/contact" element={<SectionRoute sectionKey="contact" label="Contact"><ContactPage /></SectionRoute>} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/profile-complete" element={
                    <ProtectedRoute requireProfileComplete={false}>
                        <ProfileCompletion />
                    </ProtectedRoute>
                } />

                {/* User Portal Route */}
                <Route path="/portal/*" element={
                    <ProtectedRoute allowedRoles={['User', 'Admin', 'SuperAdmin']}>
                        <UserDashboard />
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
                    <Route path="profile" element={<AdminProfile />} />
                    <Route path="management" element={
                        <ProtectedRoute allowedRoles={['SuperAdmin']}>
                            <AdminManagement />
                        </ProtectedRoute>
                    } />
                    <Route path="sections" element={
                        <ProtectedRoute allowedRoles={['SuperAdmin']}>
                            <SectionSettings />
                        </ProtectedRoute>
                    } />
                    <Route path="stories" element={<StoriesManagement />} />
                    <Route path="events" element={<EventsManagement />} />
                    <Route path="gallery" element={<AdminGallery />} />
                    <Route path="reviews" element={<ReviewsManagement />} />
                    <Route path="community" element={<CommunityManagement />} />
                    <Route path="pillars" element={<PillarsManagement />} />
                    <Route path="merchandise" element={
                        <ProtectedRoute allowedRoles={['SuperAdmin']}>
                            <MerchandiseManagement />
                        </ProtectedRoute>
                    } />
                    <Route path="users" element={<UsersManagement />} />
                </Route>
            </Routes>

            {/* Global Cookie Consent Banner */}
            <CookieBanner />

            {/* Global AI Chat Assistant */}
            {!isLoading && <AIChatAssistant />}
        </div>
    );
}

export default App;
