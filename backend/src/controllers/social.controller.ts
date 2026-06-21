import { Request, Response } from 'express';

export const getInstagramFeed = async (req: Request, res: Response) => {
    try {
        // High-quality mock data for Instagram
        const mockPosts = [
            {
                id: 'ig-1',
                type: 'IMAGE',
                url: 'https://instagram.com/mountaineer_mallu',
                imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                caption: 'Pushing past the clouds. Basecamp established at 5,400m. The summit awaits. 🏔️❄️ #alpinism #mountaineering #summit',
                likes: 12450,
                comments: 342,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            },
            {
                id: 'ig-2',
                type: 'VIDEO',
                url: 'https://instagram.com/mountaineer_mallu',
                imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                caption: 'Whiteout conditions on the ridge. Trust your gear, trust your ropemate. 🌪️🧗‍♂️ #expedition #alpine #climbing',
                likes: 8930,
                comments: 156,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            },
            {
                id: 'ig-3',
                type: 'CAROUSEL_ALBUM',
                url: 'https://instagram.com/mountaineer_mallu',
                imageUrl: 'https://images.unsplash.com/photo-1516934955-a4daa4d2e3e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                caption: 'Sunrise over the jagged peaks of the Dolomites. Nothing compares to this golden hour. 🌅 #dolomites #goldenhour #nature',
                likes: 21040,
                comments: 890,
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
            }
        ];

        res.json({ success: true, data: mockPosts });
    } catch (error) {
        console.error('Error fetching Instagram feed:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getYouTubeFeed = async (req: Request, res: Response) => {
    try {
        // High-quality mock data for YouTube
        const mockVideos = [
            {
                id: 'yt-1',
                title: 'Surviving a Category 5 Blizzard on K2 - The Death Zone',
                url: 'https://youtube.com/c/mountaineer_mallu',
                thumbnailUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                views: '1.2M',
                publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
                duration: '45:20'
            },
            {
                id: 'yt-2',
                title: 'Essential Alpine Gear Guide 2026 | What\'s in my Pack?',
                url: 'https://youtube.com/c/mountaineer_mallu',
                thumbnailUrl: 'https://images.unsplash.com/photo-1522008342704-6b265b543c46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                views: '450K',
                publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(), // 12 days ago
                duration: '18:15'
            }
        ];

        res.json({ success: true, data: mockVideos });
    } catch (error) {
        console.error('Error fetching YouTube feed:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
