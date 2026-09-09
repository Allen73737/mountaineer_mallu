import React from 'react';

interface SectionScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    id?: string;
}

export const SectionScrollReveal: React.FC<SectionScrollRevealProps> = ({
    children,
    className = '',
    id,
}) => {
    return (
        <section id={id} className={`relative w-full ${className}`}>
            {children}
        </section>
    );
};
