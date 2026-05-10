import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, Role, Permissions } from '../../store/useAuthStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Role[];
    requiredPermission?: keyof Permissions;
    requireProfileComplete?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
    requiredPermission,
    requireProfileComplete = true
}) => {
    const { isLoggedIn, user, isLoading } = useAuthStore();
    const location = useLocation();

    // Show loading while auth is being verified from cookie
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-8 h-8 border-2 border-alpine-glacier/30 border-t-alpine-glacier rounded-full animate-spin" />
            </div>
        );
    }

    // 1. Check basic authentication
    if (!isLoggedIn || !user) {
        // Redirect to login, but save the intended destination
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Check profile completion requirement
    if (requireProfileComplete && !user.isProfileComplete && location.pathname !== '/profile-complete') {
        return <Navigate to="/profile-complete" replace />;
    }

    // 3. Check role-based access
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // If it's a dashboard route, redirect to access denied. Otherwise redirect to home.
        if (location.pathname.startsWith('/summit-control-panel')) {
            return <Navigate to="/summit-control-panel/access-denied" replace />;
        }
        return <Navigate to="/" replace />;
    }

    // 4. Check specific permissions for Admins
    if (requiredPermission && user.role === 'Admin') {
        if (!user.permissions[requiredPermission]) {
            return <Navigate to="/summit-control-panel/access-denied" replace />;
        }
    }

    // All checks passed
    return <>{children}</>;
};
