import { body, param, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: 'Validation failed', 
            details: errors.array().map(err => ({ field: err.path, message: err.msg })) 
        });
    }
    next();
};

export const signupValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required.')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.')
        .escape(),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Please provide a valid email address.')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required.')
        .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters.')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,128}$/)
        .withMessage('Password must contain an uppercase letter, a lowercase letter, a number, and a special character.'),
    body('gdprConsent')
        .optional()
        .isBoolean().withMessage('GDPR consent must be a boolean value.'),
    validateRequest
];

export const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Please provide a valid email address.')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required.')
        .isLength({ max: 128 }).withMessage('Password length exceeds maximum allowed limit.'),
    validateRequest
];

export const forgotPasswordValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Please provide a valid email address.')
        .normalizeEmail(),
    validateRequest
];

export const resetPasswordValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Please provide a valid email address.')
        .normalizeEmail(),
    body('otp')
        .trim()
        .notEmpty().withMessage('OTP/Token is required.'),
    body('newPassword')
        .notEmpty().withMessage('New password is required.')
        .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters.')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,128}$/)
        .withMessage('Password must contain an uppercase letter, a lowercase letter, a number, and a special character.'),
    validateRequest
];

export const verifyOtpValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Please provide a valid email address.')
        .normalizeEmail(),
    body('otp')
        .trim()
        .notEmpty().withMessage('OTP is required.')
        .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 characters.'),
    validateRequest
];
