const RELOAD_KEY = 'mm-chunk-reload-at';

/**
 * After a redeploy, a tab opened on the previous version asks for page chunks whose hashed filenames no
 * longer exist. Browsers word that failure differently; these cover Chrome, Firefox, Safari and Vite.
 */
export const isChunkLoadError = (error: unknown) =>
    /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS|ChunkLoadError/i
        .test(String((error as Error)?.message ?? error));

/**
 * Reload once to pick up the new version. Guarded for 15 s through sessionStorage, so a chunk that is
 * genuinely missing (or an offline visitor) can't trap the page in a reload loop: the second failure
 * falls through to the normal error screen instead. Returns true when a reload was started.
 */
export const reloadForNewVersion = () => {
    try {
        const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
        if (Date.now() - last < 15000) return false;
        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    } catch {
        return false;
    }
    window.location.reload();
    return true;
};
