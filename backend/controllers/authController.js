import User from '../models/User.js';
import SecurityLog from '../models/SecurityLog.js';
import { generateToken, setTokenCookie, clearTokenCookie } from '../middleware/auth.js';
import { OAuth2Client } from 'google-auth-library';
import otpGenerator from 'otp-generator';
import bcrypt from 'bcryptjs';
import { sendEmail, getOtpEmailTemplate } from '../services/email.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Password strength validation ───────────────────────────────────────
// Broadened to accept many more special characters for higher entropy
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,128}$/;

const validatePasswordStrength = (password) => {
    if (!password || typeof password !== 'string') return false;
    if (password.length > 128) return false; // Prevent bcrypt DoS (very long passwords)
    return STRONG_PASSWORD_REGEX.test(password);
};

// ── Email normalization ────────────────────────────────────────────────
const normalizeEmail = (email) => {
    if (!email || typeof email !== 'string') return '';
    return email.trim().toLowerCase();
};

// POST /api/auth/signup
export const signup = async (req, res, next) => {
    try {
        const { name, email, password, gdprConsent } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        // Validate name length
        if (name.length < 2 || name.length > 100) {
            return res.status(400).json({ error: 'Username must be between 2 and 100 characters.' });
        }

        // Validate email format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please provide a valid email address.' });
        }

        if (!validatePasswordStrength(password)) {
            return res.status(400).json({ error: 'Password must be 8-128 characters with an uppercase letter, a lowercase letter, a number, and a special character.' });
        }

        const normalizedEmail = normalizeEmail(email);

        // Check if user already exists by email
        const existingEmail = await User.findOne({ email: normalizedEmail });
        if (existingEmail) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        // Check if user already exists by name (case-insensitive)
        const existingName = await User.findOne({ name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
        if (existingName) {
            return res.status(409).json({ error: 'This username is already taken. Please choose another one.' });
        }

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password,
            gdprConsent: gdprConsent || false
        });

        const token = generateToken(user._id, user.tokenVersion);
        setTokenCookie(res, token);

        res.status(201).json({
            message: 'Account created successfully.',
            user: user.toProfileJSON()
        });
    } catch (error) {
        // Handle Mongoose duplicate key error just in case
        if (error.code === 11000) {
             if (error.keyPattern && error.keyPattern.name) {
                 return res.status(409).json({ error: 'This username is already taken. Please choose another one.' });
             }
             if (error.keyPattern && error.keyPattern.email) {
                 return res.status(409).json({ error: 'An account with this email already exists.' });
             }
        }
        next(error);
    }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const normalizedEmail = normalizeEmail(email);

        // Find user and include password + lockout fields
        const user = await User.findOne({ email: normalizedEmail }).select('+password +loginAttempts +lockUntil');
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Check if account is locked
        if (user.isLocked) {
            const lockRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
            return res.status(423).json({ 
                error: `Account is temporarily locked due to too many failed attempts. Please try again in ${lockRemaining} minute${lockRemaining > 1 ? 's' : ''}.`,
                lockedUntil: user.lockUntil.toISOString(),
                lockRemaining: Math.ceil((user.lockUntil - Date.now()) / 1000)
            });
        }

        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            // Log security event
            try {
                await SecurityLog.create({
                    type: 'login_failure',
                    email: normalizedEmail,
                    userId: user._id,
                    ip: req.ip || req.connection.remoteAddress,
                    userAgent: req.headers['user-agent'],
                    details: 'Invalid password'
                });
            } catch (e) { console.error('Failed to log security event:', e); }

            // Increment failed login attempts
            await user.incrementLoginAttempts();

            // Check if this attempt triggered a lock
            const updatedUser = await User.findById(user._id).select('+loginAttempts +lockUntil');
            if (updatedUser.isLocked) {
                return res.status(423).json({ 
                    error: 'Account locked due to too many failed login attempts. Please try again in 30 minutes.',
                    lockedUntil: updatedUser.lockUntil.toISOString(),
                    lockRemaining: Math.ceil((updatedUser.lockUntil - Date.now()) / 1000)
                });
            }

            const remainingAttempts = 5 - (updatedUser.loginAttempts || 0);
            return res.status(401).json({ 
                error: `Invalid email or password.${remainingAttempts <= 3 ? ` ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before lockout.` : ''}`
            });
        }

        // Successful login — reset attempts
        if (user.loginAttempts > 0) {
            await user.resetLoginAttempts();
        }

        // Log security event
        try {
            await SecurityLog.create({
                type: 'login_success',
                email: normalizedEmail,
                userId: user._id,
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent']
            });
        } catch (e) { console.error('Failed to log security event:', e); }

        const token = generateToken(user._id, user.tokenVersion);
        setTokenCookie(res, token);

        res.json({
            message: 'Login successful.',
            user: user.toProfileJSON()
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/demo-login
export const demoLogin = async (req, res, next) => {
    try {
        const demoEmail = 'demo@mountaineermallu.com';
        let user = await User.findOne({ email: demoEmail });

        if (!user) {
            // Generate a random strong password for the demo user
            const randomPassword = 'Demo' + Math.random().toString(36).slice(-8) + '123!@#';
            
            user = await User.create({
                name: 'Explorer Demo',
                email: demoEmail,
                password: randomPassword,
                gdprConsent: true,
                isProfileComplete: true,
                bio: 'Passionate alpine explorer checking out the Mountaineer Mallu portal. Love the fresh mountain air and the thrill of the ascent!',
                socialLinks: {
                    instagram: 'https://instagram.com/mountaineermallu',
                    strava: 'https://strava.com'
                },
                roles: ['user']
            });
        }

        // Reset any lockout just in case
        if (user.loginAttempts > 0 || user.lockUntil) {
            await user.resetLoginAttempts();
        }

        const token = generateToken(user._id, user.tokenVersion);
        setTokenCookie(res, token);

        res.json({
            message: 'Demo login successful.',
            user: user.toProfileJSON()
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/logout
export const logout = (req, res) => {
    clearTokenCookie(res);
    res.json({ message: 'Logged out successfully.' });
};

// GET /api/auth/me — persistent login check + silent token refresh
// Every time this is called (on page load), we issue a fresh token.
// This means as long as the user visits within 30 days, they stay logged in forever.
export const getMe = async (req, res) => {
    // Silently refresh the token to extend the session
    const freshToken = generateToken(req.user._id, req.user.tokenVersion);
    setTokenCookie(res, freshToken);

    res.json({ user: req.user.toProfileJSON() });
};

// GET /api/auth/check-username/:name — username availability check
export const checkUsername = async (req, res) => {
    try {
        const { name } = req.params;
        if (!name || name.length < 2) {
            return res.json({ available: false, message: 'Username too short' });
        }
        
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const exists = await User.findOne({ name: { $regex: new RegExp(`^${escapedName}$`, 'i') } });
        
        res.json({ 
            available: !exists,
            message: exists ? 'Username is already taken' : 'Username is available'
        });
    } catch {
        res.json({ available: false, message: 'Unable to check availability' });
    }
};

// POST /api/auth/google
export const googleSignIn = async (req, res, next) => {
    try {
        const { credential } = req.body;
        if (!credential) return res.status(400).json({ error: 'Google credential is required' });

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        const normalizedEmail = normalizeEmail(email);
        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            // Check if name exists, if so append something to make it unique
            let uniqueName = name;
            let counter = 1;
            while (await User.findOne({ name: uniqueName })) {
                 uniqueName = `${name} ${counter}`;
                 counter++;
            }

            user = await User.create({
                name: uniqueName,
                email: normalizedEmail,
                googleId,
                avatar: picture,
                gdprConsent: true,
                isProfileComplete: false
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            if (!user.avatar) user.avatar = picture;
            await user.save();
        }

        // Reset any lockout on successful Google auth
        if (user.loginAttempts > 0 || user.lockUntil) {
            await user.resetLoginAttempts();
        }

        const token = generateToken(user._id, user.tokenVersion);
        setTokenCookie(res, token);

        res.json({
            message: 'Google Sign-In successful.',
            user: user.toProfileJSON()
        });
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        res.status(401).json({ error: 'Google authentication failed' });
    }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const normalizedEmail = normalizeEmail(email);

        // Always return a generic success message to prevent email enumeration
        const genericResponse = { message: 'If an account with that email exists, a verification code has been sent.' };

        if (!normalizedEmail) {
            return res.json(genericResponse);
        }

        const user = await User.findOne({ email: normalizedEmail });
        
        if (!user) {
            // Return same response whether user exists or not (anti-enumeration)
            return res.json(genericResponse);
        }

        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        
        // Hash the OTP before storing — never store plain text
        const hashedOtp = await bcrypt.hash(otp, 10);

        user.resetPasswordOtp = hashedOtp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        try {
            await sendEmail({
                to: user.email,
                subject: 'Mountaineer Mallu - Password Reset Verification',
                html: getOtpEmailTemplate(otp, user.name)
            });
        } catch (emailError) {
            // Clear OTP if email fails to send
            user.resetPasswordOtp = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            console.error('Email send failed:', emailError);
            return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
        }

        res.json(genericResponse);
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/verify-otp
export const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required.' });
        }

        const user = await User.findOne({ 
            email: normalizedEmail, 
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordOtp');

        if (!user || !user.resetPasswordOtp) {
            return res.status(400).json({ error: 'Invalid or expired OTP.' });
        }

        // Compare against hashed OTP
        const isOtpValid = await bcrypt.compare(otp, user.resetPasswordOtp);
        if (!isOtpValid) {
            return res.status(400).json({ error: 'Invalid or expired OTP.' });
        }

        // Generate a one-time reset token (separate from OTP) for the password reset step
        const resetToken = otpGenerator.generate(32, { upperCaseAlphabets: true, specialChars: false, lowerCaseAlphabets: true });
        const hashedResetToken = await bcrypt.hash(resetToken, 10);
        
        user.resetPasswordOtp = hashedResetToken; // Replace OTP with reset token
        user.resetPasswordExpires = Date.now() + 5 * 60 * 1000; // 5 min for password reset
        await user.save();

        res.json({ message: 'OTP verified successfully.', resetToken });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        const normalizedEmail = normalizeEmail(email);
        
        if (!validatePasswordStrength(newPassword)) {
            return res.status(400).json({ error: 'Password must be 8-128 characters with an uppercase letter, a lowercase letter, a number, and a special character.' });
        }

        const user = await User.findOne({ 
            email: normalizedEmail, 
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordOtp');

        if (!user || !user.resetPasswordOtp) {
            return res.status(400).json({ error: 'Invalid or expired session. Please request a new OTP.' });
        }

        // Verify the reset token
        const isTokenValid = await bcrypt.compare(otp, user.resetPasswordOtp);
        if (!isTokenValid) {
            return res.status(400).json({ error: 'Invalid or expired session. Please request a new OTP.' });
        }

        user.password = newPassword; // Will be hashed by pre-save hook
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        // Reset lockout on password reset
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        // Invalidate all existing sessions
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();

        res.json({ message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        next(error);
    }
};
