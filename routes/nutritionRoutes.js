const express = require('express');
const router = express.Router();
const { analyzeFood, storeNutrition, upload } = require('../controllers/nutritionController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/analyze', upload.single('image'), analyzeFood);

// Protected routes
router.post('/store', protect, storeNutrition);

module.exports = router;

