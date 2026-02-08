require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const config = require('./config/config');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(helmet());
app.use(cookieParser());

// IMPORTANT: No global express.json() or urlencoded() here.
// We move them into specific routes to prevent them from "eating" the image stream.

const authRoutes = require('./routes/authRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/nutrition', nutritionRoutes);

app.get('/health', (req, res) => res.json({ statusCode: 200, success: true, status: 'healthy' }));

app.use(errorHandler);

const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI);
        logger.info(`Connected to MongoDB`);
        app.listen(config.PORT, () => logger.info(`Server running on port ${config.PORT}`));
    } catch (error) {
        logger.error('DB Error', error.message);
        process.exit(1);
    }
};
connectDB();