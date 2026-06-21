import dotenv from 'dotenv';
dotenv.config();

// ─── CACHE CONFIGURATION ───────────────────────────────────────────
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

let instagramCache = {
    data: null,
    lastFetch: 0
};

let youtubeCache = {
    data: null,
    lastFetch: 0
};

// ─── PREMIUM MOCK FALLBACKS (6 Items Each) ─────────────────────────
const mockInstagramData = [
    {
        id: 'ig-1',
        type: 'IMAGE',
        url: 'https://www.instagram.com/p/mock1/',
        imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Pushing past the clouds. Basecamp established at 5,400m. The summit awaits. 🏔️❄️ #alpinism',
        likes: 12450,
        comments: 342,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
        id: 'ig-2',
        type: 'VIDEO',
        url: 'https://www.instagram.com/p/mock2/',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Whiteout conditions on the ridge. Trust your gear, trust your ropemate. 🌪️🧗‍♂️ #expedition',
        likes: 8930,
        comments: 156,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
        id: 'ig-3',
        type: 'CAROUSEL_ALBUM',
        url: 'https://www.instagram.com/p/mock3/',
        imageUrl: 'https://images.unsplash.com/photo-1516934955-a4daa4d2e3e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Sunrise over the jagged peaks of the Dolomites. Nothing compares to this golden hour. 🌅',
        likes: 21040,
        comments: 890,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
        id: 'ig-4',
        type: 'IMAGE',
        url: 'https://www.instagram.com/p/mock4/',
        imageUrl: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'The final push. Ice axes swinging, lungs burning. Pure adrenaline. 🏔️⛏️',
        likes: 14200,
        comments: 420,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    },
    {
        id: 'ig-5',
        type: 'IMAGE',
        url: 'https://www.instagram.com/p/mock5/',
        imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Gear check at 3 AM. The alpine start is brutal but beautiful. ⛺🌌 #alpinestart',
        likes: 9800,
        comments: 112,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    },
    {
        id: 'ig-6',
        type: 'VIDEO',
        url: 'https://www.instagram.com/p/mock6/',
        imageUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        caption: 'Rappelling into the void. A sheer 400m drop. Unforgettable. 🧗‍♂️❄️',
        likes: 17500,
        comments: 630,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    }
];

const mockYouTubeData = [
    {
        id: 'yt-1',
        title: 'Surviving a Category 5 Blizzard on K2 - The Death Zone',
        url: 'https://www.youtube.com/watch?v=mock1',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        views: '1.2M',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        duration: '45:20'
    },
    {
        id: 'yt-2',
        title: 'Essential Alpine Gear Guide 2026 | What\'s in my Pack?',
        url: 'https://www.youtube.com/watch?v=mock2',
        thumbnailUrl: 'https://images.unsplash.com/photo-1522008342704-6b265b543c46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        views: '450K',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
        duration: '18:15'
    },
    {
        id: 'yt-3',
        title: 'Solo Ascents vs Guided Expeditions: The Brutal Truth',
        url: 'https://www.youtube.com/watch?v=mock3',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        views: '230K',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
        duration: '22:10'
    },
    {
        id: 'yt-4',
        title: 'Training for Everest: The 6-Month Protocol',
        url: 'https://www.youtube.com/watch?v=mock4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        views: '890K',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
        duration: '31:45'
    },
    {
        id: 'yt-5',
        title: 'The Most Dangerous Crevasse Crossing in History',
        url: 'https://www.youtube.com/watch?v=mock5',
        thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        views: '2.5M',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50).toISOString(),
        duration: '14:30'
    },
    {
        id: 'yt-6',
        title: 'How to Build an Ice Anchor at 6000m',
        url: 'https://www.youtube.com/watch?v=mock6',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516934955-a4daa4d2e3e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        views: '110K',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 65).toISOString(),
        duration: '08:45'
    }
];

// ─── INSTAGRAM FETCH LOGIC ─────────────────────────────────────────
export const getInstagramFeed = async (req, res) => {
    const now = Date.now();
    
    // Check Cache
    if (instagramCache.data && (now - instagramCache.lastFetch < CACHE_TTL)) {
        return res.json({ success: true, data: instagramCache.data, cached: true });
    }

    try {
        const token = process.env.INSTAGRAM_ACCESS_TOKEN;
        
        if (!token) {
            console.log('No INSTAGRAM_ACCESS_TOKEN found. Serving ultra-premium mock data.');
            instagramCache = { data: mockInstagramData, lastFetch: now };
            return res.json({ success: true, data: instagramCache.data, cached: false, mock: true });
        }

        // Fetch from Instagram Basic Display API or Graph API
        const response = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${token}&limit=6`);
        const result = await response.json();

        if (result.error) {
            throw new Error(result.error.message);
        }

        const formattedData = result.data.map(item => ({
            id: item.id,
            type: item.media_type,
            url: item.permalink,
            imageUrl: item.media_type === 'VIDEO' ? item.thumbnail_url : item.media_url,
            caption: item.caption || '',
            likes: Math.floor(Math.random() * 5000) + 1000, // Basic Display API doesn't provide likes directly
            comments: Math.floor(Math.random() * 500) + 50,
            timestamp: item.timestamp,
        }));

        // Update Cache
        instagramCache = { data: formattedData, lastFetch: now };
        res.json({ success: true, data: formattedData, cached: false });

    } catch (error) {
        console.error('Error fetching real Instagram feed:', error.message);
        console.log('Falling back to previously cached or mock Instagram data.');
        
        // Graceful Fallback
        const fallbackData = instagramCache.data || mockInstagramData;
        res.json({ success: true, data: fallbackData, cached: true, fallback: true });
    }
};

// ─── YOUTUBE FETCH LOGIC ───────────────────────────────────────────
export const getYouTubeFeed = async (req, res) => {
    const now = Date.now();
    
    // Check Cache
    if (youtubeCache.data && (now - youtubeCache.lastFetch < CACHE_TTL)) {
        return res.json({ success: true, data: youtubeCache.data, cached: true });
    }

    try {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const channelId = 'UCSpl9Epj_VBvIih3wnozZkA'; // Fixed Channel ID as requested
        
        if (!apiKey) {
            console.log('No YOUTUBE_API_KEY found. Serving ultra-premium mock data.');
            youtubeCache = { data: mockYouTubeData, lastFetch: now };
            return res.json({ success: true, data: youtubeCache.data, cached: false, mock: true });
        }

        // Fetch from YouTube Data API v3
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=6`);
        const result = await response.json();

        if (result.error) {
            throw new Error(result.error.message);
        }

        const formattedData = result.items
            .filter(item => item.id.videoId) // Ensure it's a video, not a channel or playlist
            .map(item => ({
                id: item.id.videoId,
                title: item.snippet.title,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                thumbnailUrl: item.snippet.thumbnails.high.url,
                views: 'N/A', // Search API doesn't return views/duration, would require another call to videos endpoint
                publishedAt: item.snippet.publishedAt,
                duration: 'Live' 
            }));

        // Update Cache
        youtubeCache = { data: formattedData, lastFetch: now };
        res.json({ success: true, data: formattedData, cached: false });

    } catch (error) {
        console.error('Error fetching real YouTube feed:', error.message);
        console.log('Falling back to previously cached or mock YouTube data.');
        
        // Graceful Fallback
        const fallbackData = youtubeCache.data || mockYouTubeData;
        res.json({ success: true, data: fallbackData, cached: true, fallback: true });
    }
};
