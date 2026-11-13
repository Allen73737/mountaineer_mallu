import Event from '../models/Event.js';
import Story from '../models/Story.js';
import GalleryItem from '../models/GalleryItem.js';
import Post from '../models/Post.js';
import Group from '../models/Group.js';
import { parseEventStart } from '../utils/eventDate.js';

/**
 * Summit Passport: stamps for every expedition a member has joined, badges earned from what they
 * actually did on the platform, and a year-in-review summary for the shareable card.
 */
const BADGES = [
    { id: 'first-steps', name: 'First Steps', description: 'Joined your first expedition', test: s => s.summits >= 1 },
    { id: 'rope-team', name: 'Rope Team', description: 'Completed 3 expeditions', test: s => s.summits >= 3 },
    { id: 'high-altitude', name: 'High Altitude', description: 'Completed 10 expeditions', test: s => s.summits >= 10 },
    { id: 'expert-line', name: 'Expert Line', description: 'Finished an Advanced or Expert route', test: s => s.hardest >= 3 },
    { id: 'storyteller', name: 'Storyteller', description: 'Published a story', test: s => s.stories >= 1 },
    { id: 'chronicler', name: 'Chronicler', description: 'Published 5 stories', test: s => s.stories >= 5 },
    { id: 'lens', name: 'Through the Lens', description: 'Had media accepted into the gallery', test: s => s.media >= 1 },
    { id: 'trailblazer', name: 'Trailblazer', description: 'Shared a GPS route with a story', test: s => s.routes >= 1 },
    { id: 'campfire', name: 'Campfire Voice', description: 'Posted 10 times in the community', test: s => s.posts >= 10 },
    { id: 'faction', name: 'Faction Member', description: 'Joined a community group', test: s => s.groups >= 1 },
    { id: 'onam', name: 'Home in the Hills', description: 'Joined a cultural gathering', test: s => s.cultural >= 1 },
    { id: 'thousand', name: 'Thousand Metres', description: 'Logged 1,000 m of climbing in route uploads', test: s => s.gainM >= 1000 },
];

const DIFFICULTY_RANK = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };

// GET /api/users/me/passport
export const getPassport = async (req, res, next) => {
    try {
        const uid = req.user._id;
        const now = new Date();
        const year = now.getFullYear();

        const [events, stories, media, posts, groups] = await Promise.all([
            Event.find({ participants: uid }).select('title date time location difficulty category image').lean(),
            Story.find({ createdBy: uid, status: 'approved' }).select('title createdAt route.distanceKm route.gainM region').lean(),
            GalleryItem.countDocuments({ uploadedBy: uid, status: 'approved' }),
            Post.find({ author: uid }).select('reactions createdAt').lean(),
            Group.countDocuments({ members: uid }),
        ]);

        const dated = events.map(e => ({ ...e, start: parseEventStart(e.date, e.time) }));
        const past = dated.filter(e => e.start && e.start < now).sort((a, b) => b.start - a.start);
        const upcoming = dated.filter(e => e.start && e.start >= now).sort((a, b) => a.start - b.start);

        const withRoutes = stories.filter(s => s.route?.distanceKm);
        const stats = {
            summits: past.length,
            upcoming: upcoming.length,
            stories: stories.length,
            media,
            posts: posts.length,
            reactionsReceived: posts.reduce((n, p) => n + (p.reactions?.length || 0), 0),
            groups,
            routes: withRoutes.length,
            distanceKm: Math.round(withRoutes.reduce((n, s) => n + (s.route.distanceKm || 0), 0) * 10) / 10,
            gainM: Math.round(withRoutes.reduce((n, s) => n + (s.route.gainM || 0), 0)),
            hardest: past.reduce((m, e) => Math.max(m, DIFFICULTY_RANK[e.difficulty] || 0), 0),
            cultural: past.filter(e => e.category === 'cultural').length,
            places: [...new Set(past.map(e => e.location).filter(Boolean))].length,
        };

        const inYear = (d) => d && new Date(d).getFullYear() === year;
        const yearPast = past.filter(e => inYear(e.start));
        const yearInReview = {
            year,
            summits: yearPast.length,
            places: [...new Set(yearPast.map(e => e.location))].slice(0, 6),
            stories: stories.filter(s => inYear(s.createdAt)).length,
            posts: posts.filter(p => inYear(p.createdAt)).length,
            gainM: Math.round(withRoutes.filter(s => inYear(s.createdAt)).reduce((n, s) => n + (s.route.gainM || 0), 0)),
            highlight: yearPast.sort((a, b) => (DIFFICULTY_RANK[b.difficulty] || 0) - (DIFFICULTY_RANK[a.difficulty] || 0))[0]?.title || null,
        };

        res.json({
            stats,
            stamps: past.map(e => ({ id: e._id, title: e.title, location: e.location, difficulty: e.difficulty, category: e.category, date: e.start })),
            upcoming: upcoming.map(e => ({ id: e._id, title: e.title, location: e.location, date: e.start })),
            badges: BADGES.map(({ test, ...b }) => ({ ...b, earned: test(stats) })),
            yearInReview,
        });
    } catch (error) {
        next(error);
    }
};
