// Centralized configuration
module.exports = {
    // App
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Database
    MONGODB_URI: process.env.MONGODB_URI,

    // JWT
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRE: process.env.JWT_EXPIRE || '1d',
    JWT_COOKIE_EXPIRE: process.env.JWT_COOKIE_EXPIRE || 7,

    JWT_SECRET: process.env.JWT_SECRET,  // ← add this
    JWT_EXPIRE: process.env.JWT_EXPIRE || '7d', // ← add this

    // AI
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: 'gemini-2.5-flash',

    // File Upload
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/heic', 'image/heif', 'image/avif', 'image/*'],

    // Rate Limiting
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100,

    // Password
    PASSWORD_MIN_LENGTH: 6,

    // API
    API_VERSION: '1.0.0'
};
