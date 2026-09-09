import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { SidePanel } from './components/layout/SidePanel';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { Toaster } from 'sonner';
import { MaintenanceBanner } from './components/ui/MaintenanceBanner';
import { ComingSoon } from './components/ui/ComingSoon';
import { CookieBanner } from './components/ui/CookieBanner';
import { CustomCursor } from './components/ui/CustomCursor';
import { InteractiveParticles } from './components/ui/InteractiveParticles';
import { AtmosphericBackground } from './components/ui/AtmosphericBackground';
import { NetworkStatusToast } from './components/ui/NetworkStatusToast';
import { Home } from './pages/Home';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { RouteSuspenseSkeleton } from './components/ui/Skeleton';

import { useStore } from './store/useStore';
import { useAuthStore } from './store/useAuthStore';
import { useSiteSettings } from './store/useSiteSettings';
import { setAuthInvalidatedCallback } from './lib/api';
import { peaksData, hashPeakName, defaultPool, snowyPool, nightPool } from './data/peaks';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AIChatAssistant } from './components/ui/AIChatAssistant';
import { TourGuide } from './components/ui/TourGuide';
import { DemoLockOverlay } from './components/ui/DemoLockOverlay';
import { SmoothScrollProvider, useLenis } from './components/ui/SmoothScrollProvider';

// Dynamic Route Imports (Code Splitting for Optimal Loading Performance)
const StoriesPage = lazy(() => import('./pages/Stories').then(m => ({ default: m.StoriesPage })));
const StoryDetail = lazy(() => import('./pages/StoryDetail').then(m => ({ default: m.StoryDetail })));
const EventsPage = lazy(() => import('./pages/Events').then(m => ({ default: m.EventsPage })));
const EventDetail = lazy(() => import('./pages/EventDetail').then(m => ({ default: m.EventDetail })));
const GalleryPage = lazy(() => import('./pages/Gallery').then(m => ({ default: m.GalleryPage })));
const CommunityPage = lazy(() => import('./pages/CommunityPage').then(m => ({ default: m.CommunityPage })));
const TeamPage = lazy(() => import('./pages/Team').then(m => ({ default: m.TeamPage })));
const ReviewsPage = lazy(() => import('./pages/Reviews').then(m => ({ default: m.ReviewsPage })));
const ShopPage = lazy(() => import('./pages/Shop').then(m => ({ default: m.ShopPage })));
const ContactPage = lazy(() => import('./pages/Contact').then(m => ({ default: m.ContactPage })));
const NotFoundPage = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFoundPage })));

const AuthPage = lazy(() => import('./pages/auth/AuthPage').then(m => ({ default: m.AuthPage })));
const ProfileCompletion = lazy(() => import('./pages/auth/ProfileCompletion').then(m => ({ default: m.ProfileCompletion })));

const UserDashboard = lazy(() => import('./pages/user/UserDashboard').then(m => ({ default: m.UserDashboard })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview').then(m => ({ default: m.AdminOverview })));
const AccessDenied = lazy(() => import('./pages/admin/AccessDenied').then(m => ({ default: m.AccessDenied })));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile').then(m => ({ default: m.AdminProfile })));
const AdminManagement = lazy(() => import('./pages/admin/AdminManagement').then(m => ({ default: m.AdminManagement })));
const StoriesManagement = lazy(() => import('./pages/admin/StoriesManagement').then(m => ({ default: m.StoriesManagement })));
const EventsManagement = lazy(() => import('./pages/admin/EventsManagement').then(m => ({ default: m.EventsManagement })));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery').then(m => ({ default: m.AdminGallery })));
const CommunityManagement = lazy(() => import('./pages/admin/CommunityManagement').then(m => ({ default: m.CommunityManagement })));
const UsersManagement = lazy(() => import('./pages/admin/UsersManagement').then(m => ({ default: m.UsersManagement })));
const SectionSettings = lazy(() => import('./pages/admin/SectionSettings').then(m => ({ default: m.SectionSettings })));
const PillarsManagement = lazy(() => import('./pages/admin/PillarsManagement').then(m => ({ default: m.PillarsManagement })));
const ReviewsManagement = lazy(() => import('./pages/admin/ReviewsManagement').then(m => ({ default: m.ReviewsManagement })));
const MerchandiseManagement = lazy(() => import('./pages/admin/MerchandiseManagement').then(m => ({ default: m.MerchandiseManagement })));
const CampaignAutopilot = lazy(() => import('./pages/admin/CampaignAutopilot').then(m => ({ default: m.CampaignAutopilot })));

function ScrollToTop() {
    const { pathname } = useLocation();
    const { lenis } = useLenis();

    useEffect(() => {
        if (lenis) {
            lenis.scrollTo(0, { immediate: true });
        } else {
            window.scrollTo(0, 0);
        }
    }, [pathname, lenis]);

    return null;
}

/** Route guard — redirects hidden sections, shows ComingSoon for coming_soon */
const SectionRoute = ({ sectionKey, label, children }: { sectionKey: string; label: string; children: React.ReactNode }) => {
    const { settings, loaded } = useSiteSettings();
    if (!loaded) return null;
    const sectionConfig = settings.sections[sectionKey];
    if (sectionConfig && sectionConfig.status === 'hidden') return <Navigate to="/" replace />;
    if (sectionConfig && sectionConfig.status === 'coming_soon') return <ComingSoon sectionName={label} />;
    return <>{children}</>;
};

function App() {
    const { theme, weather } = useStore();
    const { checkAuth, user } = useAuthStore();
    const { fetchSettings, initSocket, disconnectSocket, settings } = useSiteSettings();
    const { i18n } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const getPreloadUrl = () => {
        const date = new Date();
        const dateSeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
        const peak = peaksData[dateSeed % peaksData.length];
        const isFreezing = weather.isSnowing || (weather.temp !== null && weather.temp <= 0);
        
        let imgUrl = '';
        if (peak.images) {
            imgUrl = isDark ? peak.images.night : (isFreezing ? peak.images.snowy : peak.images.default);
        } else {
            const hash = hashPeakName(peak.name);
            if (isDark) imgUrl = nightPool[hash % nightPool.length];
            else if (isFreezing) imgUrl = snowyPool[hash % snowyPool.length];
            else imgUrl = defaultPool[hash % defaultPool.length];
        }
        return imgUrl.includes('unsplash') ? `${imgUrl}&auto=format&fit=crop&w=1600&q=75` : imgUrl;
    };
    const preloadUrl = getPreloadUrl();

    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/summit-control-panel');
    const isPortalRoute = location.pathname.startsWith('/portal');
    const isAuthRoute = location.pathname === '/profile-complete';
    const isAppLayout = !isAdminRoute && !isPortalRoute && !isAuthRoute;

    const isAdmin = user?.role === 'Admin' || user?.role === 'SuperAdmin';
    const showMaintenance = settings.maintenance.enabled && !(isAdmin && settings.maintenance.allowAdminAccess);

    // Check persistent auth and fetch settings/weather on app mount
    useEffect(() => {
        checkAuth();
        fetchSettings();
        initSocket();

        // Fetch weather globally
        const fetchWeather = async () => {
            const date = new Date();
            const dateSeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
            const peak = peaksData[dateSeed % peaksData.length];
            
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${peak.lat}&longitude=${peak.lon}&current=temperature_2m,weather_code`;
                const response = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);
                const data = await response.json();
                const temp = data.current.temperature_2m;
                const code = data.current.weather_code;
                const isSnowing = [71, 73, 75, 77, 85, 86].includes(code);

                let conditionText = 'Clear conditions';
                if (code >= 1 && code <= 3) conditionText = 'Partly cloudy';
                else if (code >= 45 && code <= 48) conditionText = 'Foggy/low visibility';
                else if (code >= 51 && code <= 67) conditionText = 'Raining/Freezing Rain';
                else if (isSnowing) conditionText = 'Snowing';
                else if (code >= 95) conditionText = 'Thunderstorm';

                useStore.getState().setWeather({ temp, condition: conditionText, isSnowing });
                useStore.getState().setWeatherLoaded(true);
            } catch (error) {
                console.error("Failed to fetch alpine weather:", error);
                useStore.getState().setWeather({ temp: null, condition: 'Offline (Last known: Clear)', isSnowing: false });
                useStore.getState().setWeatherLoaded(true);
            }
        };

        const state = useStore.getState();
        if (!state.weatherLoaded) {
            fetchWeather();
        }

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
        <SmoothScrollProvider>
            <div className="min-h-screen bg-transparent dark:bg-transparent text-alpine-navy dark:text-alpine-snow transition-colors duration-500 overflow-x-hidden film-grain">
            <div className="fixed inset-0 bg-[#030712] dark:bg-black -z-50 pointer-events-none" />
            <link rel="preload" as="image" href={preloadUrl} />
            <Toaster richColors position="bottom-right" theme={theme === 'system' ? 'system' : theme as 'light' | 'dark'} />
            <CustomCursor />
            <AtmosphericBackground />
            <InteractiveParticles />
            <ScrollToTop />

            <AnimatePresence>
                {isLoading && (
                    <LoadingScreen 
                        onComplete={() => {
                            setIsLoading(false);
                            sessionStorage.setItem('hasSeenLoadingScreen', 'true');
                        }} 
                    />
                )}
            </AnimatePresence>

            {/* Maintenance Banner */}
            {settings.maintenance.enabled && !isAdminRoute && (
                <MaintenanceBanner
                    message={settings.maintenance.message}
                    isAdmin={isAdmin}
                    theme={settings.maintenance.theme as any}
                />
            )}

            {isAppLayout && (
                <>
                    <Navbar />
                    <SidePanel />
                </>
            )}
            <Suspense fallback={<RouteSuspenseSkeleton />}>
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
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/signup" element={<AuthPage />} />
                    <Route path="/profile-complete" element={
                        <ProtectedRoute requireProfileComplete={false}>
                            <ProfileCompletion />
                        </ProtectedRoute>
                    } />

                    {/* User Dashboard */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <UserDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Admin Panel */}
                    <Route path="/summit-control-panel/access-denied" element={<AccessDenied />} />

                    <Route path="/summit-control-panel" element={
                        <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }>
                        <Route index element={<AdminOverview />} />
                        <Route path="overview" element={<AdminOverview />} />
                        <Route path="profile" element={<AdminProfile />} />
                        <Route path="sections" element={<SectionSettings />} />
                        <Route path="admins" element={
                            <ProtectedRoute allowedRoles={['SuperAdmin']}>
                                <AdminManagement />
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
                        <Route path="campaigns" element={
                            <ProtectedRoute allowedRoles={['SuperAdmin']}>
                                <CampaignAutopilot />
                            </ProtectedRoute>
                        } />
                    </Route>
                    {/* Global Catch-All 404 Route */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>

            {/* Global Cookie Consent Banner */}
            <CookieBanner />

            {/* Network Status & Reconnection Indicator */}
            <NetworkStatusToast />

            {/* Global Demo Lock for Read-Only Mode */}
            {user?.email === 'demo@mountaineermallu.com' && <DemoLockOverlay />}

            {/* Global Tour Guide */}
            <TourGuide />

            {/* Global AI Chat Assistant */}
            {!isLoading && (
                <AIChatAssistant />
            )}
            </div>
        </SmoothScrollProvider>
    );
}

export default App;
