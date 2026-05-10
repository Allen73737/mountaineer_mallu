import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
    sections: {
        stories:   { type: String, enum: ['visible', 'hidden', 'coming_soon'], default: 'visible' },
        events:    { type: String, enum: ['visible', 'hidden', 'coming_soon'], default: 'visible' },
        gallery:   { type: String, enum: ['visible', 'hidden', 'coming_soon'], default: 'visible' },
        community: { type: String, enum: ['visible', 'hidden', 'coming_soon'], default: 'visible' },
        shop:      { type: String, enum: ['visible', 'hidden', 'coming_soon'], default: 'coming_soon' },
        reviews:   { type: String, enum: ['visible', 'hidden', 'coming_soon'], default: 'visible' },
        team:      { type: String, enum: ['visible', 'hidden', 'coming_soon'], default: 'visible' },
        contact:   { type: String, enum: ['visible', 'hidden', 'coming_soon'], default: 'visible' },
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
