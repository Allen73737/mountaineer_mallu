import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User.js';
import Story from './models/Story.js';
import Event from './models/Event.js';
import GalleryItem from './models/GalleryItem.js';
import Group from './models/Group.js';
import Merchandise from './models/Merchandise.js';
import Pillar from './models/Pillar.js';
import Review from './models/Review.js';
import SiteSettings from './models/SiteSettings.js';

const SEED_DATA = {
    stories: [
        {
            title: "The Silence of Eiger's North Face",
            excerpt: "A four-day ascent through the most treacherous wall in the Alps. The mountain spoke only in the language of falling ice.",
            content: "The north face of the Eiger does not ask for your strength; it asks for your soul. At 3,967 meters, the wall towers above Grindelwald like an impenetrable amphitheater of cold limestone and black verglas.\n\nOur team of four Malayalee alpinists started the traverse from the Stollenloch window at 03:00 hours. The temperature stood at -14°C. The route across the First and Second Icefields required pitch-perfect crampon placement—one errant strike could trigger a slide down to the scree 1,800 meters below.\n\nBy day three, we bivouacked at Death Bivouac under a star-strewn sky so clear that the lights of Interlaken looked like embers on a distant stove. When we reached the Mittellegi ridge and stood on the summit cornices, the sense of silence was deafening. It was not triumph; it was deep, reverent relief.",
            author: 'K. MENON',
            date: 'Oct 2025',
            region: 'Berner Oberland',
            image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600'
        },
        {
            title: 'Chamonix Aiguilles: A Granite Cathedral',
            excerpt: 'Ice-draped spires reached toward the heavens as we traversed the Cosmiques Arête under a blood-red dawn.',
            content: "Chamonix in autumn is a study in raw contrast. Golden larch forests in the valley give way to ancient seracs and razor-sharp granite needles suspended in the alpine troposphere.\n\nOur mission was the traverse from the Aiguille du Midi down across the Vallée Blanche toward Pointe Helbronner. As the morning sun cracked over the summit of Mont Blanc, the granite pillars illuminated in iridescent copper and pink.\n\nThe snow conditions tested our rope team's synchronicity at every meter. Stepping across bottomless crevasses with 60km/h katabatic winds howling required pure trust. When you tie into a rope with brothers from home in this cathedral of rock, you understand why we climb.",
            author: 'A. KRISHNAN',
            date: 'Sep 2025',
            region: 'Mont Blanc Massif',
            image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600'
        },
        {
            title: 'Zugspitze: The Roof of Germany',
            excerpt: "Standing atop Deutschland's highest point at sunrise, the Bavarian Alps unfolded like a map of frozen possibility.",
            content: "Climbing Zugspitze via the Höllental route is the quintessential Bavarian rite of passage. Passing through the churning gorge of Höllentalklamm into the hanging valley of Höllentalanger, the massive Zugspitze rock massif rises 2,000 vertical meters ahead.\n\nThe final via ferrata ladders bolted into the vertical cliff edge above the Höllentalferner glacier demand absolute focus. At 2,962 meters, the golden summit cross greeted us bathed in the first amber rays of sunrise, with four countries visible on the horizon.",
            author: 'R. NAIR',
            date: 'Aug 2025',
            region: 'Wetterstein',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600'
        },
        {
            title: 'Matterhorn Cervino: Dance with the Horn',
            excerpt: 'The Hörnli Ridge demanded every ounce of technique. At 4,478m, the Pennine Alps surrendered their crown.',
            content: "No mountain on Earth commands the imagination like the Matterhorn. Rising as an isolated, twisting pyramid of rock and ice, it dominates the Zermatt valley like a mythical beast.\n\nOur ascent of the classic Hörnli Ridge began in pitch darkness at 03:30 from the Hörnli Hut. The Solvay emergency hut at 4,003 meters served as our brief breathing stop before the formidable Shoulder and fixed ropes.\n\nPulling over the final summit crest onto the snow-capped Swiss summit was transcendent. A brotherhood forged through thousands of vertical feet of technical precision.",
            author: 'S. PILLAI',
            date: 'Jul 2025',
            region: 'Pennine Alps',
            image: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=1600'
        }
    ],
    events: [
        {
            title: 'Operation Ortler: Winter Assault',
            date: 'Nov 15, 2026',
            time: '05:00 AM',
            location: 'Ortler Group, South Tyrol',
            difficulty: 'Expert',
            totalSlots: 10,
            type: 'Alpine Expedition',
            description: 'Multi-day winter traverse of the Ortler summit via the Hintergrat ridge. Technical ice climbing, crampon mastery, and glacier safety required.',
            image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1600'
        },
        {
            title: 'Bavarian Alps Reconnaissance',
            date: 'Dec 08, 2026',
            time: '07:00 AM',
            location: 'Garmisch-Partenkirchen',
            difficulty: 'Intermediate',
            totalSlots: 18,
            type: 'Day Hike',
            description: 'Scenic traverse through the Bavarian limestone alps with panoramic views of the Zugspitze massif and warm alpine hut hospitality.',
            image: 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=1600'
        },
        {
            title: 'Dolomites Via Ferrata Circuit',
            date: 'Jan 22, 2027',
            time: '06:30 AM',
            location: 'Cortina dAmpezzo',
            difficulty: 'Advanced',
            totalSlots: 14,
            type: 'Via Ferrata',
            description: 'Protected climbing routes through legendary Dolomite towers. Harness, helmet, and twin-carabiner via ferrata set mandatory.',
            image: 'https://images.unsplash.com/photo-1490682143684-14369e18dce8?w=1600'
        },
        {
            title: 'Grossglockner High Alpine Traverse',
            date: 'Feb 18, 2027',
            time: '04:30 AM',
            location: 'Hohe Tauern, Austria',
            difficulty: 'Expert',
            totalSlots: 8,
            type: 'Alpine Expedition',
            description: 'Ascent of Austrias highest peak across the Pasterze glacier and narrow Kleinglockner notch. Pure high-altitude mountaineering.',
            image: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?w=1600'
        }
    ],
    gallery: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600', title: 'Alpine Dawn over the Ridge', span: 'col-span-2 row-span-2' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600', title: 'Starlit Summit Bivouac', span: 'col-span-1 row-span-1' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600', title: 'Sea of Clouds at 3000m', span: 'col-span-1 row-span-2' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=1600', title: 'Hörnli Ridge Traverse', span: 'col-span-1 row-span-1' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1600', title: 'Frozen Glacier Seracs', span: 'col-span-2 row-span-1' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=1600', title: 'Lush Alpine Valley Floor', span: 'col-span-1 row-span-2' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1490682143684-14369e18dce8?w=1600', title: 'Dolomite Towers at Sunset', span: 'col-span-1 row-span-1' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1600', title: 'Golden Hour Mountain Descent', span: 'col-span-2 row-span-1' }
    ],
    groups: [
        { name: 'High Altitude Division', description: 'Elite technical climbing division for ascents above 4,000m. Members master mixed terrain, ice axes, and glacier rope maneuvers.' },
        { name: 'Trail Runners Battalion', description: 'Ultra-distance alpine trail running across mountain passes. Weekly training circuits and competitive alpine trail runs.' },
        { name: 'Kerala Alpine Connect', description: 'Malayalee hiking community connecting Kerala heritage with European Alpine adventures. Cultural hikes and family ascents.' }
    ],
    merchandise: [
        {
            name: 'Ascent Pro 3L Hard-Shell Jacket',
            description: 'Three-layer waterproof breathable shell with storm hood and taped seams. Engineered for extreme blizzard conditions and high-wind summits.',
            price: 249,
            originalPrice: 299,
            currency: '€',
            image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&fit=crop',
            category: 'Outerwear',
            inStock: true,
            badge: 'Summit Choice',
            order: 1
        },
        {
            name: 'Merino Wool Thermal Base Layer',
            description: 'Pure 260g/m² natural Merino wool for optimal thermoregulation and odor resistance during multi-day alpine bivouacs.',
            price: 89,
            originalPrice: 110,
            currency: '€',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&fit=crop',
            category: 'Apparel',
            inStock: true,
            badge: 'Popular',
            order: 2
        },
        {
            name: 'Expedition Rucksack 55L Ultra',
            description: 'Ripstop Dyneema expedition pack with ice axe holsters, rope strap, and ergonomic load-transfer suspension system.',
            price: 189,
            originalPrice: 220,
            currency: '€',
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&fit=crop',
            category: 'Gear',
            inStock: true,
            badge: 'Pro Tier',
            order: 3
        },
        {
            name: 'Carbon Ascent Trekking Poles',
            description: 'Ultra-lightweight 100% carbon fiber flick-lock poles with extended EVA foam grips and tungsten carbide tips.',
            price: 129,
            originalPrice: 150,
            currency: '€',
            image: 'https://images.unsplash.com/photo-1502224562085-639556652f33?q=80&w=800&fit=crop',
            category: 'Gear',
            inStock: true,
            order: 4
        },
        {
            name: 'Glacier Cat 4 Alpine Sunglasses',
            description: 'Category 4 mineral glass lenses with leather side shields providing 100% UV protection against snow blindness.',
            price: 159,
            originalPrice: 180,
            currency: '€',
            image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&fit=crop',
            category: 'Accessories',
            inStock: true,
            badge: 'Essential',
            order: 5
        },
        {
            name: 'Thermal Summit Mountaineering Gloves',
            description: 'Primaloft-insulated goatskin leather gloves with waterproof GORE-TEX insert for ice climbing dexterity in sub-zero terrain.',
            price: 59,
            originalPrice: 75,
            currency: '€',
            image: 'https://images.unsplash.com/photo-1515234558509-0d3dbcf0fbab?q=80&w=800&fit=crop',
            category: 'Accessories',
            inStock: true,
            order: 6
        }
    ],
    pillars: [
        {
            name: 'Arun Thomas',
            role: 'Chief Expedition Leader & UIAGM Guide',
            quote: 'Mountains do not distinguish between who you are. They reward preparation, humility, and heart.',
            image: 'https://images.unsplash.com/photo-1548365328-8c6db2b291d5?q=80&w=800&h=1000&fit=crop',
            order: 1
        },
        {
            name: 'Rahul Krishnan',
            role: 'Alpine Safety & High Route Specialist',
            quote: 'The real summit is getting every single climber back down safely together.',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&h=1000&fit=crop',
            order: 2
        },
        {
            name: 'Sneha Nair',
            role: 'Logistics & Community Director',
            quote: 'We created this family so no Malayalee hiker ever climbs European peaks alone.',
            image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&h=1000&fit=crop',
            order: 3
        },
        {
            name: 'Divya Ravindran',
            role: 'Wilderness Medic & Route Safety',
            quote: 'Calculated boldness paired with medical vigilance makes impossible objectives routine.',
            image: 'https://images.unsplash.com/photo-1583852002596-fdfeb193306a?q=80&w=800&h=1000&fit=crop',
            order: 4
        }
    ],
    reviews: [
        {
            content: 'The Mont Blanc expedition changed my life. The guides were incredible and the Malayalee camaraderie on the mountain was unmatched.',
            rating: 5,
            status: 'approved'
        },
        {
            content: 'Exceptional gear guidance and route planning. I felt secure every single step of the way traversing the Eiger ridges.',
            rating: 5,
            status: 'approved'
        },
        {
            content: 'Mountaineer Mallu is not just an alpine club; it is a true brotherhood. The winter meetups and safety briefings are gold standard.',
            rating: 5,
            status: 'approved'
        },
        {
            content: 'A truly premium experience. The attention to detail from the basecamp hut to summit push was flawless. Will ascend again.',
            rating: 5,
            status: 'approved'
        },
        {
            content: 'They pushed me beyond my limits while ensuring safety was never compromised. The perfect balance of grit and leadership.',
            rating: 5,
            status: 'approved'
        }
    ]
};

const seed = async () => {
    try {
        console.log('🌱 Starting comprehensive database seed for launch...');

        await mongoose.connect(process.env.MONGODB_URI, { dbName: 'mountaineer-mallu' });
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Story.deleteMany({}),
            Event.deleteMany({}),
            GalleryItem.deleteMany({}),
            Group.deleteMany({}),
            Merchandise.deleteMany({}),
            Pillar.deleteMany({}),
            Review.deleteMany({}),
            SiteSettings.deleteMany({})
        ]);
        console.log('🗑️  Cleared existing database records');

        // Create Super Admin
        const superadmin = await User.create({
            name: 'Super Admin',
            email: process.env.SEED_ADMIN_EMAIL || 'superadmin@mountaineermallu.com',
            password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!',
            role: 'superadmin',
            isProfileComplete: true,
            gdprConsent: true,
            permissions: {
                manageStories: true,
                manageEvents: true,
                manageGallery: true,
                manageCommunity: true,
                manageUsers: true
            }
        });
        console.log(`👑 Super Admin created: ${superadmin.email}`);

        // Create Demo Explorer User
        const demoUser = await User.create({
            name: 'Demo Explorer',
            email: 'demo@mountaineermallu.com',
            password: 'DemoClimber2026!',
            role: 'user',
            isProfileComplete: true,
            gdprConsent: true,
            permissions: {}
        });
        console.log(`🧗 Demo Explorer created: ${demoUser.email}`);

        // Seed stories
        const stories = await Story.insertMany(
            SEED_DATA.stories.map(s => ({ ...s, createdBy: superadmin._id }))
        );
        console.log(`📖 ${stories.length} stories seeded`);

        // Seed events
        const events = await Event.insertMany(
            SEED_DATA.events.map(e => ({ ...e, createdBy: superadmin._id, participants: [demoUser._id] }))
        );
        console.log(`🗓️  ${events.length} events seeded`);

        // Seed gallery
        const gallery = await GalleryItem.insertMany(
            SEED_DATA.gallery.map(g => ({ ...g, status: 'approved', uploadedBy: superadmin._id, approvedBy: superadmin._id }))
        );
        console.log(`🖼️  ${gallery.length} gallery items seeded`);

        // Seed groups
        const groups = await Group.insertMany(
            SEED_DATA.groups.map(g => ({
                ...g,
                members: [superadmin._id, demoUser._id],
                moderators: [superadmin._id],
                createdBy: superadmin._id
            }))
        );
        console.log(`👥 ${groups.length} community groups seeded`);

        // Seed merchandise
        const merchandise = await Merchandise.insertMany(SEED_DATA.merchandise);
        console.log(`🎒 ${merchandise.length} merchandise items seeded`);

        // Seed pillars (team leaders)
        const pillars = await Pillar.insertMany(SEED_DATA.pillars);
        console.log(`🏔️  ${pillars.length} pillars (team leaders) seeded`);

        // Seed reviews
        const reviews = await Review.insertMany(
            SEED_DATA.reviews.map(r => ({ ...r, author: demoUser._id }))
        );
        console.log(`⭐ ${reviews.length} reviews seeded`);

        // Seed SiteSettings ensuring all sections are active and visible
        const siteSettings = await SiteSettings.create({
            sections: {
                stories: { status: 'visible', bgTheme: 'white' },
                events: { status: 'visible', bgTheme: 'white' },
                gallery: { status: 'visible', bgTheme: 'white' },
                community: { status: 'visible', bgTheme: 'white' },
                shop: { status: 'visible', bgTheme: 'white' },
                reviews: { status: 'visible', bgTheme: 'white' },
                team: { status: 'visible', bgTheme: 'white' },
                contact: { status: 'visible', bgTheme: 'white' }
            },
            maintenance: {
                enabled: false,
                message: '',
                allowAdminAccess: true
            }
        });
        console.log(`⚙️  Site settings initialized: All sections active and visible for launch.`);

        console.log('\n🚀 Database seeded successfully with production-ready launch data!');
        console.log(`\n📋 Launch Credentials:`);
        console.log(`   Super Admin: ${superadmin.email}`);
        console.log(`   Password:    ${process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!'}`);
        console.log(`   Demo User:   ${demoUser.email}`);
        console.log(`   Password:    DemoClimber2026!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
};

seed();

