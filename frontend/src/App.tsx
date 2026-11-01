import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, MotionConfig } from 'framer-motion';
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
import { peaksData, hashPeakName, defaultPool, snowyPool, nightPool, getHeroImageUrl } from './data/peaks';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { SmoothScrollProvider } from './components/ui/SmoothScrollProvider';
import { RouteTransition, getRouteKey } from './components/ui/RouteTransition';
import { CinematicTitles } from './components/ui/CinematicTitles';
import { LogoHandoff } from './components/ui/LogoHandoff';
import { Flashlight } from './components/ui/Flashlight';
import { AltitudeGauge } from './components/ui/AltitudeGauge';
import { DayCycleGrade } from './components/ui/DayCycleGrade';
import { LensFX } from './components/ui/LensFX';
import { MorphOverlay } from './components/ui/MorphOverlay';
import { WeatherAtmosphere } from './components/ui/WeatherAtmosphere';
import { loadAlpineWeather } from './lib/weather';
import { startQualityProbe } from './lib/quality';
import { SafeBoundary } from './components/ui/SafeBoundary';
import { ErrorState } from './components/ui/ErrorState';

// Global overlays that only matter after the page is up (chat, guided tour with driver.js, demo lock):
// split out of the main bundle so first load parses less JavaScript
const AIChatAssistant = lazy(() => import('./components/ui/AIChatAssistant').then(m => ({ default: m.AIChatAssistant })));
const TourGuide = lazy(() => import('./components/ui/TourGuide').then(m => ({ default: m.TourGuide })));
const DemoLockOverlay = lazy(() => import('./components/ui/DemoLockOverlay').then(m => ({ default: m.DemoLockOverlay })));

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
    // Brand loader plays on every full page load (first visit and each refresh); in-app navigation never remounts it
    const [isLoading, setIsLoading] = useState(true);
    // Decorative layers (WebGL aurora, particle canvas, custom cursor) are expensive to boot.
    // While the brand loader's logo draws itself, hold them back so it stays
    // smooth during the busiest part of the intro.
    const [decorReady, setDecorReady] = useState(() => !isLoading);
    useEffect(() => {
        if (decorReady) return;
        const t = setTimeout(() => setDecorReady(true), 1650);
        return () => clearTimeout(t);
    }, [decorReady]);


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
        return getHeroImageUrl(imgUrl);
    };
    const preloadUrl = getPreloadUrl();

    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/summit-control-panel');
    const isPortalRoute = location.pathname.startsWith('/portal');
    // Auth screens are full-bleed with their own header, so they skip the global Navbar/SidePanel
    const isAuthRoute = ['/profile-complete', '/login', '/signup'].includes(location.pathname);
    const isAppLayout = !isAdminRoute && !isPortalRoute && !isAuthRoute;

    const isAdmin = user?.role === 'Admin' || user?.role === 'SuperAdmin';
    const showMaintenance = settings.maintenance.enabled && !(isAdmin && settings.maintenance.allowAdminAccess);

    // Check persistent auth and fetch settings/weather on app mount
    useEffect(() => {
        checkAuth();
        fetchSettings();
        initSocket();

        // Live conditions at today's peak drive the hero plate, the weather layer and the footer readout
        loadAlpineWeather();

        // Wire up auto-logout on 401 (expired/invalid session)
        setAuthInvalidatedCallback(() => {
            useAuthStore.getState().logoutAsync();
        });

        return () => disconnectSocket();
    }, []);

    // Watch the frame rate and step effects down if this device can't keep up. Starts after the intro
    // (the loader's own animation and the decor booting would read as a slow device) plus a short warm-up.
    useEffect(() => {
        if (isLoading) return;
        let stopProbe = () => {};
        const t = window.setTimeout(() => { stopProbe = startQualityProbe(); }, 3000);
        return () => { window.clearTimeout(t); stopProbe(); };
    }, [isLoading]);

    useEffect(() => {
        const root = window.document.documentElement;
        const next = theme === 'system'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : theme;
        const changing = !root.classList.contains(next);

        // Cross-fade colours only while the theme actually flips (no cost the rest of the time)
        if (changing && (root.classList.contains('light') || root.classList.contains('dark'))) {
            root.classList.add('theme-fading');
            window.setTimeout(() => root.classList.remove('theme-fading'), 450);
        }
        root.classList.remove('light', 'dark');
        root.classList.add(next);
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
        <MotionConfig reducedMotion="user">
        <SmoothScrollProvider>
            <div className="min-h-screen bg-transparent dark:bg-transparent text-alpine-navy dark:text-alpine-snow transition-colors duration-500 overflow-x-clip film-grain">
            <div className="fixed inset-0 bg-[#030712] dark:bg-black -z-50 pointer-events-none" />
            {!isAdminRoute && <div className="cinema-vignette" aria-hidden="true" />}
            <CinematicTitles />
            {/* Decorative layers: if one fails (GPU, driver, browser quirk) it switches itself off instead of taking the page down */}
            {location.pathname === '/' && <SafeBoundary name="DayCycleGrade"><DayCycleGrade /></SafeBoundary>}
            {!isAdminRoute && <SafeBoundary name="LensFX"><LensFX /></SafeBoundary>}
            {decorReady && isAppLayout && <SafeBoundary name="WeatherAtmosphere"><WeatherAtmosphere /></SafeBoundary>}
            <SafeBoundary name="MorphOverlay"><MorphOverlay /></SafeBoundary>
            <LogoHandoff />
            <Flashlight />
            {location.pathname === '/' && !isLoading && <AltitudeGauge />}
            {location.pathname === '/' && <link rel="preload" as="image" href={preloadUrl} fetchPriority="high" />}
            <Toaster richColors position="bottom-right" theme={theme === 'system' ? 'system' : theme as 'light' | 'dark'} />
            {decorReady && (
                <>
                    <SafeBoundary name="CustomCursor"><CustomCursor /></SafeBoundary>
                    {/* Auth screens have their own photographic backdrop — keep them clean */}
                    {!isAuthRoute && <SafeBoundary name="AtmosphericBackground"><AtmosphericBackground /></SafeBoundary>}
                    {!isAuthRoute && <SafeBoundary name="InteractiveParticles"><InteractiveParticles /></SafeBoundary>}
                </>
            )}

            <AnimatePresence>
                {isLoading && (
                    <LoadingScreen 
                        onComplete={() => setIsLoading(false)}
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
            {/* Suspense sits inside the transition so the route curtain stays on screen while a lazy page loads */}
            <RouteTransition routeKey={getRouteKey(location.pathname)}>
                {/* A page that crashes shows an error card in place; the navbar, menu and the rest of the site keep working */}
                <SafeBoundary name="Page" resetKey={location.pathname} fallback={reset => (
                    <div className="min-h-screen flex items-center justify-center px-6 pt-28 pb-16">
                        <div className="max-w-md w-full">
                            <ErrorState
                                title="This page hit a snag"
                                message="Something went wrong while showing this page. Try again, or head back to base camp."
                                onRetry={reset}
                                backLink="/"
                                backText="Back to base camp"
                            />
                        </div>
                    </div>
                )}>
                <Suspense fallback={<RouteSuspenseSkeleton />}>
                <Routes location={location}>
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
                </SafeBoundary>
            </RouteTransition>

            {/* Global Cookie Consent Banner */}
            <CookieBanner />

            {/* Network Status & Reconnection Indicator */}
            <NetworkStatusToast />

            {/* Global Demo Lock for Read-Only Mode */}
            {user?.email === 'demo@mountaineermallu.com' && <SafeBoundary name="DemoLockOverlay"><Suspense fallback={null}><DemoLockOverlay /></Suspense></SafeBoundary>}

            {/* Global Tour Guide */}
            <SafeBoundary name="TourGuide"><Suspense fallback={null}><TourGuide /></Suspense></SafeBoundary>

            {/* Global AI Chat Assistant */}
            {!isLoading && (
                <SafeBoundary name="AIChatAssistant"><Suspense fallback={null}><AIChatAssistant /></Suspense></SafeBoundary>
            )}
            </div>
        </SmoothScrollProvider>
        </MotionConfig>
    );
}

export default App;
