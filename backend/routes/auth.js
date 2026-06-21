import { Router } from 'express';
import { signup, login, logout, getMe, googleSignIn, forgotPassword, verifyOtp, resetPassword, checkUsername, demoLogin } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { 
    signupValidation, 
    loginValidation, 
    forgotPasswordValidation, 
    resetPasswordValidation, 
    verifyOtpValidation 
} from '../middleware/validation.js';

const router = Router();

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/demo-login', demoLogin);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

// Username availability check
router.get('/check-username/:name', checkUsername);

// Google Auth
router.post('/google', googleSignIn);

// Password Reset Flow
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/verify-otp', verifyOtpValidation, verifyOtp);
router.post('/reset-password', resetPasswordValidation, resetPassword);

export default router;
