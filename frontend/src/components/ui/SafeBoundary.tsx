import { Component, ErrorInfo, ReactNode } from 'react';
import { isChunkLoadError, reloadForNewVersion } from '../../lib/chunkRecovery';

interface Props {
    children?: ReactNode;
    /** What to show instead of the crashed subtree. Omit (or null) to quietly render nothing. */
    fallback?: ReactNode | ((reset: () => void) => ReactNode);
    /** Changing this clears the error, e.g. the route path, so navigating away recovers. */
    resetKey?: unknown;
    /** Label for the console message. */
    name?: string;
}

interface State { error: Error | null }

/**
 * A local error boundary. The app-wide ErrorBoundary replaces the entire site, navbar included, so
 * pages, home sections and decorative layers each get one of these: a crash then costs only that piece.
 * A stale-chunk error after a deploy triggers a one-time reload instead (lib/chunkRecovery).
 */
export class SafeBoundary extends Component<Props, State> {
    public state: State = { error: null };

    public static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    public componentDidCatch(error: Error, info: ErrorInfo) {
        if (isChunkLoadError(error) && reloadForNewVersion()) return;
        console.error(`[${this.props.name ?? 'SafeBoundary'}] crashed:`, error, info.componentStack);
    }

    public componentDidUpdate(prev: Props) {
        if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
    }

    private reset = () => this.setState({ error: null });

    public render() {
        if (!this.state.error) return this.props.children;
        const { fallback } = this.props;
        return typeof fallback === 'function' ? fallback(this.reset) : (fallback ?? null);
    }
}
