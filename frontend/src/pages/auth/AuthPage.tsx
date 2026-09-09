import React from 'react';
import { useLocation } from 'react-router-dom';
import { AuthHub } from '../../components/auth/AuthHub';

export const AuthPage: React.FC = () => {
    const location = useLocation();
    const mode = location.pathname.includes('signup') ? 'signup' : 'login';
    return <AuthHub initialMode={mode} />;
};
