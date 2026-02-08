const { validationResult, body } = require('express-validator');
const config = require('../config/config');

// Validation error handler - run after validation chain
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            statusCode: 400,
            success: false,
            message: errors.array()[0].msg,
            errors: errors.array()
        });
    }
    next();
};

// Reusable validation chains
const registerValidation = () => [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: config.PASSWORD_MIN_LENGTH })
        .withMessage(`Password must be at least ${config.PASSWORD_MIN_LENGTH} characters`)
];

const loginValidation = () => [
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];

const updatePasswordValidation = () => [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: config.PASSWORD_MIN_LENGTH })
        .withMessage(`New password must be at least ${config.PASSWORD_MIN_LENGTH} characters`)
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('New password must be different from current password');
            }
            return true;
        })
];

const updateProfileValidation = () => [
    body('name')
        .trim()
        .optional()
        .notEmpty().withMessage('Name cannot be empty')
        .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
    body('email')
        .trim()
        .optional()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail()
];

module.exports = {
    handleValidationErrors,
    registerValidation,
    loginValidation,
    updatePasswordValidation,
    updateProfileValidation
};
