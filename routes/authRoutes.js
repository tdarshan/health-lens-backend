const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateProfile, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
    handleValidationErrors,
    registerValidation,
    loginValidation,
    updatePasswordValidation,
    updateProfileValidation
} = require('../middleware/validation');

// Add JSON parser for auth routes
router.use(express.json());

// Public routes
router.post('/register',
    registerValidation(),
    handleValidationErrors,
    register
);

router.post('/login',
    loginValidation(),
    handleValidationErrors,
    login
);

// Protected routes
router.get('/me', protect, getMe);

router.put('/updateprofile',
    protect,
    updateProfileValidation(),
    handleValidationErrors,
    updateProfile
);

router.put('/updatepassword',
    protect,
    updatePasswordValidation(),
    handleValidationErrors,
    updatePassword
);

router.post('/logout', protect, logout);

module.exports = router;

