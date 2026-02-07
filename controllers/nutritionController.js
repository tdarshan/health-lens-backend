const { GoogleGenerativeAI } = require('@google/generative-ai');
const sharp = require('sharp');
const multer = require('multer');
const { ErrorResponse } = require('../middleware/errorMiddleware');

// Configure multer for image uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to extract JSON from AI response
const extractJSON = (text) => {
    // Try to find JSON in markdown code blocks
    const codeBlockMatch = text.match(/```json?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
        text = codeBlockMatch[1];
    }

    // Try to find JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        text = jsonMatch[0];
    }

    return text;
};

// @desc    Analyze food image and return nutrition data
// @route   POST /api/nutrition/analyze
// @access  Public
exports.analyzeFood = async (req, res, next) => {
    // Check if file was uploaded (multer middleware already handled this)
    if (!req.file) {
        return next(new ErrorResponse('No image provided', 400));
    }

    try {
        // Step 1: Resize image for faster processing
        const resizedBuffer = await sharp(req.file.buffer)
            .resize(800)
            .jpeg({ quality: 80 })
            .toBuffer();

        // Step 2: Analyze with Gemini AI
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent([
            'You are a nutrition analysis assistant. Analyze the food in the image and respond ONLY with a JSON object in this exact format:\n' +
            '{"dish": "name of the dish", "calories": number, "protein": number, "carbs": number, "fat": number}\n' +
            'Do not include any markdown formatting, explanations, or additional text. Just return the raw JSON object.',
            { inlineData: { data: resizedBuffer.toString('base64'), mimeType: "image/jpeg" } }
        ]);

        // Get the response text
        const responseText = result.response.text();
        console.log('AI Response:', responseText);

        // Parse the response
        let nutrition;
        try {
            // Try direct JSON parsing first
            nutrition = JSON.parse(responseText);
        } catch (parseError) {
            // Try to extract JSON from the response
            try {
                const cleanedText = extractJSON(responseText);
                nutrition = JSON.parse(cleanedText);
            } catch (secondParseError) {
                console.error('Failed to parse AI response:', responseText);
                return next(new ErrorResponse('Failed to parse nutrition data from AI response', 500));
            }
        }

        // Validate that we have the expected fields
        const requiredFields = ['dish', 'calories', 'protein', 'carbs', 'fat'];
        const missingFields = requiredFields.filter(field => !nutrition[field]);

        if (missingFields.length > 0) {
            console.error('Missing fields in nutrition data:', missingFields, nutrition);
            return next(new ErrorResponse('AI response missing required nutrition fields', 500));
        }

        res.json({
            success: true,
            nutrition: nutrition
        });
    } catch (error) {
        console.error('Analysis error:', error);
        next(new ErrorResponse('Failed to analyze image', 500));
    }
};

// @desc    Store nutrition entry (protected route)
// @route   POST /api/nutrition/store
// @access  Private
exports.storeNutrition = async (req, res, next) => {
    // This would be implemented with a Nutrition model
    // For now, returning success message
    res.json({
        success: true,
        message: 'Nutrition entry stored successfully',
        data: req.body
    });
};

// Export multer upload for use in routes
exports.upload = upload;

