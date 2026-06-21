import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, Role, Permissions } from '../../store/useAuthStore';
import { toast } from 'sonner';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Role[];
    requiredPermission?: keyof Permissions;
    requireProfileComplete?: boolean;
}

const RedirectWithToast = ({ to, state, message, description }: { to: string, state?: any, message: string, description: string }) => {
    useEffect(() => {
        toast.error(message, {
            description: description,
            duration: 5000,
        });
    }, [message, description]);
    
    return <Navigate to={to} state={state} replace />;
};

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
        return <RedirectWithToast 
            to="/login" 
            state={{ from: location }} 
            message="Authentication Required" 
            description="You must be logged in to access this area."
        />;
    }

    // 2. Check profile completion requirement
    if (requireProfileComplete && !user.isProfileComplete && location.pathname !== '/profile-complete') {
        return <RedirectWithToast 
            to="/profile-complete" 
            message="Profile Incomplete" 
            description="Please complete your profile to continue."
        />;
    }

    // 3. Check role-based access
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (location.pathname.startsWith('/summit-control-panel')) {
            return <RedirectWithToast 
                to="/summit-control-panel/access-denied" 
                message="Access Denied" 
                description={`You do not have the necessary clearance level to access Summit Control Panel.`}
            />;
        }
        return <RedirectWithToast 
            to="/" 
            message="Access Denied" 
            description={`Your current role (${user.role}) does not permit access to this section.`}
        />;
    }

    // 4. Check specific permissions for Admins
    if (requiredPermission && user.role === 'Admin') {
        if (!user.permissions[requiredPermission]) {
            return <RedirectWithToast 
                to="/summit-control-panel/access-denied" 
                message="Restricted Zone" 
                description={`You are missing the required clearance: ${requiredPermission}.`}
            />;
        }
    }

    // All checks passed
    return <>{children}</>;
};
