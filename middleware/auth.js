const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const logger = require('../utils/logger');
const { ErrorResponse } = require('./errorMiddleware');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
    let token;

    // Check for token in headers or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
        logger.warn('No token provided for protected route');
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            logger.warn('User not found for token');
            return next(new ErrorResponse('User not found', 404));
        }

        next();
    } catch (error) {
        logger.warn('Token verification failed', error.message);
        return next(new ErrorResponse('Invalid or expired token', 401));
    }
};

// Grant access to specific roles (future use)
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (req.user.role && !roles.includes(req.user.role)) {
            logger.warn(`Unauthorized role access attempted by user ${req.user._id}`);
            return next(new ErrorResponse('Not authorized to access this route', 403));
        }
        next();
    };
};

