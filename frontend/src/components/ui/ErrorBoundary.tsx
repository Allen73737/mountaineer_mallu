import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { isChunkLoadError, reloadForNewVersion } from '../../lib/chunkRecovery';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Stale chunk after a deploy: one quiet reload picks up the new version instead of this screen
        if (isChunkLoadError(error) && reloadForNewVersion()) return;
        console.error('Uncaught React Error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-alpine-snow dark:bg-black p-4 film-grain text-alpine-navy dark:text-alpine-snow">
                    <div className="max-w-md w-full bg-white dark:bg-alpine-navy/40 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-white/10 text-center">
                        <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle className="text-red-500 dark:text-red-400" size={32} />
                        </div>
                        
                        <h1 className="text-2xl font-serif font-bold mb-3">Expedition Halted</h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                            We've encountered an unexpected crevasse. Our elite support team has been notified. Let's get you back on safe ground.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#A3C9E2] hover:bg-[#50A5E6] text-white rounded-xl font-medium transition-all active:scale-[0.98] shadow-lg shadow-[#A3C9E2]/20"
                            >
                                <RefreshCw size={18} />
                                Restart Expedition
                            </button>
                            
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-alpine-navy dark:text-white rounded-xl font-medium transition-all active:scale-[0.98]"
                            >
                                <Home size={18} />
                                Return to Basecamp
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
