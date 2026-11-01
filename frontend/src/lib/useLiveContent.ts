import { useEffect, useState } from 'react';

/**
 * Home-page sections show their built-in sample entries immediately (no layout jump, no spinner), then
 * swap in the real published entries once the API answers. If the API is unreachable or has nothing
 * published yet, the samples stay. Each item carries `live`, so links can point to a real detail page
 * only when one exists (sample entries link to the listing page instead).
 */
export const useLiveContent = <T,>(samples: T[], load: () => Promise<T[]>) => {
    const [items, setItems] = useState<(T & { live: boolean })[]>(() => samples.map(s => ({ ...s, live: false })));

    useEffect(() => {
        let cancelled = false;
        load()
            .then(live => {
                if (!cancelled && live.length) setItems(live.map(item => ({ ...item, live: true })));
            })
            .catch(() => { /* keep the samples */ });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return items;
};
