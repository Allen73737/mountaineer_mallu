import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User.js';
import Story from './models/Story.js';
import Event from './models/Event.js';
import GalleryItem from './models/GalleryItem.js';
import Group from './models/Group.js';

const SEED_DATA = {
    stories: [
        {
            title: "The Silence of Eiger's North Face",
            excerpt: "A four-day ascent through the most treacherous wall in the Alps. The mountain spoke only in the language of falling ice.",
            author: 'K. MENON',
            date: 'Oct 2025',
            region: 'Berner Oberland',
            image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600'
        },
        {
            title: 'Chamonix Aiguilles: A Granite Cathedral',
            excerpt: 'Ice-draped spires reached toward the heavens as we traversed the Cosmiques Arête under a blood-red dawn.',
            author: 'A. KRISHNAN',
            date: 'Sep 2025',
            region: 'Mont Blanc Massif',
            image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600'
        },
        {
            title: 'Zugspitze: The Roof of Germany',
            excerpt: "Standing atop Deutschland's highest point at sunrise, the Bavarian Alps unfolded like a map of frozen possibility.",
            author: 'R. NAIR',
            date: 'Aug 2025',
            region: 'Wetterstein',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600'
        },
        {
            title: 'Matterhorn Cervino: Dance with the Horn',
            excerpt: 'The Hörnli Ridge demanded every ounce of technique. At 4,478m, the Pennine Alps surrendered their crown.',
            author: 'S. PILLAI',
            date: 'Jul 2025',
            region: 'Pennine Alps',
            image: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=1600'
        }
    ],
    events: [
        {
            title: 'Operation Ortler: Winter Assault',
            date: 'Jan 15, 2026',
            time: '05:00 AM',
            location: 'Ortler Group, South Tyrol',
            difficulty: 'Expert',
            totalSlots: 8,
            type: 'Alpine Expedition',
            description: 'Multi-day winter traverse of the Ortler summit via the Hintergrat ridge. Full alpine equipment required.',
            image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1600'
        },
        {
            title: 'Bavarian Alps Reconnaissance',
            date: 'Feb 08, 2026',
            time: '07:00 AM',
            location: 'Garmisch-Partenkirchen',
            difficulty: 'Intermediate',
            totalSlots: 15,
            type: 'Day Hike',
            description: 'Scenic traverse through the Bavarian limestone alps with views of the Zugspitze massif.',
            image: 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=1600'
        },
        {
            title: 'Dolomites Via Ferrata Circuit',
            date: 'Mar 22, 2026',
            time: '06:30 AM',
            location: 'Cortina dAmpezzo',
            difficulty: 'Advanced',
            totalSlots: 12,
            type: 'Via Ferrata',
            description: 'Protected climbing routes through the legendary Dolomite towers. Harness and via ferrata set mandatory.',
            image: 'https://images.unsplash.com/photo-1490682143684-14369e18dce8?w=1600'
        }
    ],
    gallery: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600', title: 'Alpine Dawn', span: 'col-span-2 row-span-2' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600', title: 'Starlit Summit', span: 'col-span-1 row-span-1' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600', title: 'Cloud Sea', span: 'col-span-1 row-span-2' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=1600', title: 'Ridge Walker', span: 'col-span-1 row-span-1' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1600', title: 'Frozen Peak', span: 'col-span-2 row-span-1' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=1600', title: 'Valley Floor', span: 'col-span-1 row-span-2' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1490682143684-14369e18dce8?w=1600', title: 'Dolomite Towers', span: 'col-span-1 row-span-1' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1600', title: 'Golden Hour', span: 'col-span-2 row-span-1' }
    ],
    groups: [
        { name: 'High Altitude Division', description: 'Elite climbing unit for technical ascents above 4,000m. Members must demonstrate ice axe and crampon proficiency.' },
        { name: 'Trail Runners Battalion', description: 'Ultra-distance trail running across Alpine passes. Weekly training runs and monthly ultra events.' },
        { name: 'Kerala Alpine Connect', description: 'Malayalee hiking community connecting Kerala roots with Alpine adventures. Cultural events and group hikes.' }
    ]
};

const seed = async () => {
    try {
        console.log('🌱 Starting database seed...');

        await mongoose.connect(process.env.MONGODB_URI, { dbName: 'mountaineer-mallu' });
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Story.deleteMany({}),
            Event.deleteMany({}),
            GalleryItem.deleteMany({}),
            Group.deleteMany({})
        ]);
        console.log('🗑️  Cleared existing data');

        // Create superadmin
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

        // Seed stories
        const stories = await Story.insertMany(
            SEED_DATA.stories.map(s => ({ ...s, createdBy: superadmin._id }))
        );
        console.log(`📖 ${stories.length} stories seeded`);

        // Seed events
        const events = await Event.insertMany(
            SEED_DATA.events.map(e => ({ ...e, createdBy: superadmin._id }))
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
                members: [superadmin._id],
                moderators: [superadmin._id],
                createdBy: superadmin._id
            }))
        );
        console.log(`👥 ${groups.length} community groups seeded`);

        console.log('\n✅ Database seeded successfully!');
        console.log(`\n📋 Summary:`);
        console.log(`   Super Admin: ${superadmin.email}`);
        console.log(`   Stories: ${stories.length}`);
        console.log(`   Events: ${events.length}`);
        console.log(`   Gallery Items: ${gallery.length}`);
        console.log(`   Groups: ${groups.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
};

seed();
