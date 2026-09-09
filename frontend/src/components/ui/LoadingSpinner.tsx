import React from 'react';

interface LoadingSpinnerProps {
    className?: string;
    isLightBackground?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = '', isLightBackground }) => {
    // Detect theme on render (fallback to light if not dark)
    const detectLight = isLightBackground ?? (!document.documentElement.classList.contains('dark'));
    
    return (
        <div 
            className={`domino-spinner ${detectLight ? 'text-[#08284C]' : 'text-white'} ${className}`}
        >
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>
    );
};
export default LoadingSpinner;
