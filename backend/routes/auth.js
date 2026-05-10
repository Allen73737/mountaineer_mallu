import { Router } from 'express';
import { signup, login, logout, getMe, googleSignIn, forgotPassword, verifyOtp, resetPassword, checkUsername } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

// Username availability check
router.get('/check-username/:name', checkUsername);

// Google Auth
router.post('/google', googleSignIn);

// Password Reset Flow
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

export default router;
