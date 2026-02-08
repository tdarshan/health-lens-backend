const logger = require('../utils/logger');

// Custom error class for API errors
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    logger.error(`${req.method} ${req.path}`, error.message);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error = new ErrorResponse('Resource not found', 404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field} already exists`;
        error = new ErrorResponse(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new ErrorResponse(message, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new ErrorResponse('Invalid token', 401);
    }

    if (err.name === 'TokenExpiredError') {
        error = new ErrorResponse('Token expired', 401);
    }

    const statusCode = error.statusCode || 500;
    const response = {
        statusCode,
        success: false,
        message: error.message || 'Server Error'
    };

    res.status(statusCode).json(response);
};

module.exports = { ErrorResponse, errorHandler };

