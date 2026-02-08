const User = require('../models/User');
const { ErrorResponse } = require('../middleware/errorMiddleware');
const config = require('../config/config');
const logger = require('../utils/logger');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        const user = await User.create({ name, email, password });
        logger.info(`User registered: ${email}`);
        sendTokenResponse(user, 201, res);
    } catch (error) {
        logger.error(`Registration error for ${email}`, error.message);
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            logger.warn(`Login attempt failed: ${email}`);
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        logger.info(`User logged in: ${email}`);
        sendTokenResponse(user, 200, res);
    } catch (error) {
        logger.error('Login error', error.message);
        next(error);
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    logger.info(`User logged out: ${req.user.email}`);
    res.status(200).json({ statusCode: 200, success: true, message: 'Logged out successfully' });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ statusCode: 200, success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/updateprofile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const fieldsToUpdate = {};
        if (req.body.name) fieldsToUpdate.name = req.body.name;
        if (req.body.email) fieldsToUpdate.email = req.body.email;

        const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        logger.info(`Profile updated for user: ${user.email}`);
        res.status(200).json({ statusCode: 200, success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id).select('+password');

        if (!(await user.matchPassword(currentPassword))) {
            logger.warn(`Password update failed for user: ${user.email}`);
            return next(new ErrorResponse('Current password is incorrect', 401));
        }

        user.password = newPassword;
        await user.save();

        logger.info(`Password updated for user: ${user.email}`);
        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + config.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: 'strict'
    };

    if (config.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({
        statusCode,
        success: true,
        token,
        user: { id: user._id, email: user.email, name: user.name }
    });
};
