import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import encrypt from 'mongoose-encryption';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        unique: true,
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters'],
        minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please provide a valid email address']
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    password: {
        type: String,
        required: function() { return !this.googleId; },
        minlength: [8, 'Password must be at least 8 characters'],
        select: false // Don't return password by default
    },
    resetPasswordOtp: {
        type: String,
        select: false // Never return hashed OTP
    },
    resetPasswordExpires: Date,
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    },
    permissions: {
        manageStories: { type: Boolean, default: false },
        manageEvents: { type: Boolean, default: false },
        manageGallery: { type: Boolean, default: false },
        manageCommunity: { type: Boolean, default: false },
        manageUsers: { type: Boolean, default: false }
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String,
        default: ''
    },
    address: {
        place: { type: String, default: '', maxlength: 200 },
        city: { type: String, default: '', maxlength: 100 },
        state: { type: String, default: '', maxlength: 100 },
        zip: { type: String, default: '', maxlength: 20 }
    },
    phone: {
        type: String,
        default: '',
        maxlength: [20, 'Phone number too long']
    },
    whatsapp: {
        type: String,
        default: '',
        maxlength: [20, 'WhatsApp number too long']
    },
    gdprConsent: {
        type: Boolean,
        default: false
    },
    collections: [{
        name: { type: String, required: true },
        items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GalleryItem' }]
    }],
    downloads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GalleryItem' }],
    expeditionReminders: [{
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
        enabled: { type: Boolean, default: true }
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchandise'
    }],
    // ── Security: Account Lockout ──────────────────────────────────────
    loginAttempts: {
        type: Number,
        default: 0,
        select: false
    },
    lockUntil: {
        type: Date,
        select: false
    },
    // ── Security: Session Invalidation ──────────────────────────────────
    tokenVersion: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// ── Virtual: Check if account is currently locked ──────────────────────
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ── Constants ──────────────────────────────────────────────────────────
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// ── Hash password before save ──────────────────────────────────────────
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// ── Compare passwords ──────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// ── Increment login attempts or lock account ───────────────────────────
userSchema.methods.incrementLoginAttempts = async function () {
    // If previous lock has expired, reset
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    // Lock account after MAX_LOGIN_ATTEMPTS
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + LOCK_DURATION_MS };
    }

    return this.updateOne(updates);
};

// ── Reset login attempts on successful login ───────────────────────────
userSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 }
    });
};

// ── Transform role string to match frontend expected format ────────────
userSchema.methods.toProfileJSON = function () {
    const roleMap = { user: 'User', admin: 'Admin', superadmin: 'SuperAdmin' };
    return {
        id: this._id.toString(),
        name: this.name,
        email: this.email,
        role: roleMap[this.role] || 'User',
        permissions: this.permissions,
        isProfileComplete: this.isProfileComplete,
        avatar: this.avatar,
        location: this.address.city ? `${this.address.city}, ${this.address.state}` : '',
        phone: this.phone,
        whatsapp: this.whatsapp,
        collections: this.collections,
        downloads: this.downloads,
        expeditionReminders: this.expeditionReminders,
        wishlist: this.wishlist
    };
};

// ── Encryption Plugin ──────────────────────────────────────────────────
// Generate a 32-byte base64 string for ENCRYPTION_KEY if not in .env
// require('crypto').randomBytes(32).toString('base64')
if (process.env.ENCRYPTION_KEY) {
    userSchema.plugin(encrypt.mongoose, {
        encryptionKey: process.env.ENCRYPTION_KEY,
        signingKey: process.env.SIGNING_KEY || process.env.ENCRYPTION_KEY,
        encryptedFields: ['phone', 'whatsapp', 'address']
    });
} else {
    console.warn("⚠️ ENCRYPTION_KEY is missing. Data-at-rest encryption is disabled. Please add it to your .env file.");
}

const User = mongoose.model('User', userSchema);
export default User;
