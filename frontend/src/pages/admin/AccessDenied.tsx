import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const AccessDenied = () => {
    const navigate = useNavigate();

    return (
        <div className="mm-console dark min-h-[100dvh] grid place-items-center px-4 text-[var(--mm-ink)]">
            <div className="mm-backdrop" aria-hidden="true" />
            <div className="mm-panel mm-rise relative z-10 max-w-md w-full p-8 md:p-10 text-center !rounded-[1.75rem]">
                <span className="mx-auto mb-7 grid place-items-center w-16 h-16 rounded-full border border-red-300/25 text-red-300 bg-red-400/[0.06]">
                    <ShieldAlert size={26} strokeWidth={1.6} />
                </span>
                <p className="mm-eyebrow mm-eyebrow--bare justify-center mb-3">Error 403 · Restricted</p>
                <h1 className="mm-title text-4xl md:text-5xl mb-4">Above your <em>clearance</em></h1>
                <p className="mm-muted text-sm leading-relaxed mb-8">
                    This part of Summit Control needs a higher role. If you believe this is a mistake, ask a Super Admin to grant access.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => navigate(-1)} className="flex-1 mm-btn mm-btn--ghost !h-12">
                        <ArrowLeft size={16} /> Go back
                    </button>
                    <Link to="/" className="flex-1 mm-btn mm-btn--primary !h-12">Main site</Link>
                </div>
            </div>
        </div>
    );
};
