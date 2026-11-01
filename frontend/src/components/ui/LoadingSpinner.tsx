import React from 'react';
import { BrandLoader } from './BrandLoader';

interface LoadingSpinnerProps {
    className?: string;
    isLightBackground?: boolean;
}

/** Full-size buffering state: the brand's climbing-ridge mark. */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = '', isLightBackground }) => {
    const detectLight = isLightBackground ?? (!document.documentElement.classList.contains('dark'));
    return <BrandLoader size={64} className={`${detectLight ? 'text-alpine-navy' : 'text-white'} ${className}`} />;
};
export default LoadingSpinner;
