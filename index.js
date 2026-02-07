// Load environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

// Import routes
const authRoutes = require('./routes/authRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');

// Import middleware
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/nutrition', nutritionRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Wellness & Nutrition API',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                logout: 'GET /api/auth/logout',
                profile: 'GET /api/auth/me',
                updateProfile: 'PUT /api/auth/updateprofile',
                updatePassword: 'PUT /api/auth/updatepassword'
            },
            nutrition: {
                analyze: 'POST /api/nutrition/analyze',
                store: 'POST /api/nutrition/store'
            }
        }
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Global error handler middleware (must be last)
app.use(errorHandler);

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Connect to MongoDB and start server
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Start server
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error('Unhandled Rejection:', err.message);
    // Close server & exit process
    process.exit(1);
});

// Start the application
connectDB();

// Export app for testing
module.exports = app;

