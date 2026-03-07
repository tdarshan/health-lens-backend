const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/errorMiddleware');
const config = require('../config/config');
const logger = require('../utils/logger');

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Hash refresh token before storing — never store raw tokens in DB
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

// Send both access + refresh tokens in response
const sendTokenResponse = async (user, statusCode, res) => {
    const accessToken = user.getSignedJwtToken();
    const refreshToken = user.getSignedRefreshToken();

    // Store hashed refresh token in DB
    user.refreshToken = hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    // Cookie options for access token (web clients)
    const cookieOptions = {
        expires: new Date(Date.now() + config.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: 'strict',
        ...(config.NODE_ENV === 'production' && { secure: true })
    };

    res.status(statusCode)
        .cookie('token', accessToken, cookieOptions)
        .json({
            statusCode,
            success: true,
            accessToken,
            refreshToken, // raw token — React Native stores this in SecureStore
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });
};

// ─── Register ─────────────────────────────────────────────────────────────────

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        const existing = await User.findOne({ email });
        if (existing) {
            return next(new ErrorResponse('Email already in use', 400));
        }

        const user = await User.create({ name, email, password });

        logger.info(`User registered: ${email}`);
        await sendTokenResponse(user, 201, res);
    } catch (error) {
        logger.error(`Registration error for ${email}`, error.message);
        next(error);
    }
};

// ─── Login ────────────────────────────────────────────────────────────────────

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
        await sendTokenResponse(user, 200, res);
    } catch (error) {
        logger.error('Login error', error.message);
        next(error);
    }
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

// @desc    Issue new access + refresh token pair
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return next(new ErrorResponse('Refresh token is required', 400));
    }

    try {
        // 1. Verify token is structurally valid and not expired
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, config.JWT_SECRET);
        } catch (err) {
            logger.warn('Refresh token verification failed:', err.message);
            return next(new ErrorResponse('Invalid or expired refresh token', 401));
        }

        // 2. Find user and compare against stored hash
        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== hashToken(refreshToken)) {
            logger.warn(`Refresh token mismatch or user not found: ${decoded.id}`);
            return next(new ErrorResponse('Invalid refresh token', 401));
        }

        // 3. Rotate both tokens — old refresh token is now dead
        logger.info(`Tokens rotated for user: ${user.email}`);
        await sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

// ─── Logout ───────────────────────────────────────────────────────────────────

// @desc    Logout user — invalidates refresh token in DB
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    try {
        // Wipe refresh token so it can't be reused after logout
        req.user.refreshToken = null;
        await req.user.save({ validateBeforeSave: false });

        // Clear access token cookie (web clients)
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });

        logger.info(`User logged out: ${req.user.email}`);
        res.status(200).json({
            statusCode: 200,
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

// ─── Get Me ───────────────────────────────────────────────────────────────────

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

// ─── Update Profile ───────────────────────────────────────────────────────────

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

// ─── Update Password ──────────────────────────────────────────────────────────

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
        await sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};