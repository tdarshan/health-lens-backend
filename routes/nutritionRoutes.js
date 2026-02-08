const express = require('express');
const router = express.Router();
const { analyzeFood, getHistory, getImage, upload } = require('../controllers/nutritionController');
const { protect } = require('../middleware/auth');

// File upload route with protection - NO JSON parser before multer
router.post('/analyze', protect, upload.single('image'), analyzeFood);

// Add JSON parser for remaining routes
router.use(express.json());

// Get image for a nutrition entry by ID
router.get('/:id/image', protect, getImage);

// Get user's nutrition history with images
router.get('/history', protect, getHistory);

module.exports = router;