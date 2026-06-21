import mongoose from 'mongoose';

const sectionConfigSchema = new mongoose.Schema({
    status: { type: String, enum: ['visible', 'hidden', 'coming_soon'], default: 'visible' },
    bgTheme: { type: String, enum: ['alpine_blue', 'pitch_black', 'white'], default: 'white' }
}, { _id: false });

const siteSettingsSchema = new mongoose.Schema({
    sections: {
        stories:   { type: sectionConfigSchema, default: () => ({ status: 'visible', bgTheme: 'white' }) },
        events:    { type: sectionConfigSchema, default: () => ({ status: 'visible', bgTheme: 'white' }) },
        gallery:   { type: sectionConfigSchema, default: () => ({ status: 'visible', bgTheme: 'white' }) },
        community: { type: sectionConfigSchema, default: () => ({ status: 'visible', bgTheme: 'white' }) },
        shop:      { type: sectionConfigSchema, default: () => ({ status: 'coming_soon', bgTheme: 'white' }) },
        reviews:   { type: sectionConfigSchema, default: () => ({ status: 'visible', bgTheme: 'white' }) },
        team:      { type: sectionConfigSchema, default: () => ({ status: 'visible', bgTheme: 'white' }) },
        contact:   { type: sectionConfigSchema, default: () => ({ status: 'visible', bgTheme: 'white' }) },
    },
    maintenance: {
        enabled:         { type: Boolean, default: false },
        message:         { type: String, default: '' },
        allowAdminAccess: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

// Singleton pattern — always return the one document, create if missing
siteSettingsSchema.statics.getInstance = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
export default SiteSettings;
