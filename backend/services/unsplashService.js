import fetch from 'node-fetch';

export const searchUnsplashImages = async (query, perPage = 6) => {
    if (!process.env.UNSPLASH_ACCESS_KEY) {
        throw new Error('Unsplash API key not configured.');
    }

    try {
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`;
        
        const response = await fetch(url, {
            headers: {
                Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
                'Accept-Version': 'v1'
            }
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Unsplash API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        
        return data.results.map(img => ({
            id: img.id,
            url: img.urls.regular, // Standard high-res
            thumb: img.urls.thumb, // For the dropdown preview
            authorName: img.user.name,
            authorLink: img.user.links.html,
            altText: img.alt_description || 'Unsplash image'
        }));
    } catch (error) {
        console.error('[Unsplash Service] Search failed:', error.message);
        throw error;
    }
};
