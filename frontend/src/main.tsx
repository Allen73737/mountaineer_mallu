import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
// Fonts are self-hosted (bundled from @fontsource) — no request to Google, and they load from the same
// origin as the page. Only the character subsets a page actually uses are downloaded.
import '@fontsource-variable/inter'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/jetbrains-mono'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource/montserrat/400.css'
import '@fontsource/montserrat/500.css'
import '@fontsource/montserrat/600.css'
import './index.css'
import './lib/i18n'

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { reloadForNewVersion } from './lib/chunkRecovery';

// Vite fires this when a lazy page's files can't be fetched — typically a tab left open across a deploy.
// Reload once (guarded against loops) so the visitor lands on the new version instead of an error.
window.addEventListener('vite:preloadError', event => {
    if (reloadForNewVersion()) event.preventDefault();
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy_client_id_for_dev'}>
            <ErrorBoundary>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </ErrorBoundary>
        </GoogleOAuthProvider>
    </React.StrictMode>,
)
