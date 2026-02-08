const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const sharp = require("sharp");
const multer = require("multer");
const Nutrition = require("../models/Nutrition");
const { ErrorResponse } = require("../middleware/errorMiddleware");
const config = require("../config/config");
const logger = require("../utils/logger");

// Multer Configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (config.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP allowed"));
    }
  },
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

const nutritionSchema = {
  type: SchemaType.OBJECT,
  properties: {
    dish: { type: SchemaType.STRING, description: "Detailed name of the food" },
    calories: {
      type: SchemaType.NUMBER,
      description: "Total calories for the visible portion",
    },
    protein: { type: SchemaType.NUMBER, description: "Protein in grams" },
    carbs: { type: SchemaType.NUMBER, description: "Carbs in grams" },
    fat: { type: SchemaType.NUMBER, description: "Fat in grams" },
    portion_estimate: {
      type: SchemaType.STRING,
      description:
        "Explanation of perceived volume (e.g. 10-inch pizza, 2 cups of rice)",
    },
  },
  required: ["dish", "calories", "protein", "carbs", "fat", "portion_estimate"],
};

const extractJSON = (text) => {
  const codeBlockMatch = text.match(/```json?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) text = codeBlockMatch[1];
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) text = jsonMatch[0];
  return text;
};

// @desc    Analyze food image and save nutrition entry
exports.analyzeFood = async (req, res, next) => {
    if (!req.file) {
        return next(new ErrorResponse('No image provided.', 400));
    }

    try {
        const resizedBuffer = await sharp(req.file.buffer)
            .resize(1024) 
            .jpeg({ quality: 80 })
            .toBuffer();

        const model = genAI.getGenerativeModel({ 
            model: config.GEMINI_MODEL,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: nutritionSchema,
                temperature: 0.1
            }
        });

        const userServings = req.body.servings ? `User specified ${req.body.servings} serving(s).` : "Assume single standard serving.";
        
        // Updated Prompt with strict "No Food" instructions
        const prompt = `Act as a clinical dietitian. 
        FIRST: Determine if the image contains edible food. 
        IF NO FOOD IS VISIBLE: Return dish as "Non-food item", calories as 0, and describe what you see in portion_estimate.
        IF FOOD IS VISIBLE: 
        1. **Deconstruct**: List visible ingredients and estimate weight in grams.
        2. **Spatial Scaling**: Use surroundings to determine portion size. 
        3. ${userServings}
        4. Summation: Provide final macro/calorie count.
        Return ONLY a JSON object.`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: resizedBuffer.toString('base64'), mimeType: 'image/jpeg' } }
        ]);

        const responseText = result.response.text();
        let nutrition = JSON.parse(extractJSON(responseText));

        // --- VALIDATION: DO NOT SAVE IF NOT FOOD ---
        if (nutrition.calories === 0 || nutrition.dish.toLowerCase().includes("no food") || nutrition.dish.toLowerCase().includes("non-food")) {
            return res.status(422).json({
                statusCode: 422,
                success: false,
                message: "No food detected in the image. Entry not saved.",
                detected: nutrition.dish
            });
        }

        // Save only if food is valid
        const nutritionEntry = await Nutrition.create({
            user: req.user._id,
            dish: nutrition.dish,
            calories: nutrition.calories,
            protein: nutrition.protein,
            carbs: nutrition.carbs,
            fat: nutrition.fat,
            portion_estimate: nutrition.portion_estimate,
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            }
        });

        res.status(201).json({ 
            statusCode: 201, 
            success: true, 
            message: 'Nutrition analysis saved',
            data: { id: nutritionEntry._id, ...nutrition }
        });

    } catch (error) {
        logger.error('Analysis error', error.message);
        next(error);
    }
};

// @desc    Get all nutrition history with images
exports.getHistory = async (req, res, next) => {
  try {
    // Use .select('-image') to exclude the heavy buffer from the list view
    const history = await Nutrition.find({ user: req.user._id })
      .select("-image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      statusCode: 200,
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get image for a nutrition entry
// @route   GET /api/nutrition/:id/image
// @access  Private
exports.getImage = async (req, res, next) => {
  try {
    const nutrition = await Nutrition.findById(req.params.id);

    if (!nutrition) {
      return next(new ErrorResponse("Nutrition entry not found", 404));
    }

    // Verify user owns this nutrition entry
    if (nutrition.user.toString() !== req.user._id.toString()) {
      return next(
        new ErrorResponse("Not authorized to access this resource", 403),
      );
    }

    if (!nutrition.image || !nutrition.image.data) {
      return next(new ErrorResponse("No image found for this entry", 404));
    }

    res.set("Content-Type", nutrition.image.contentType);
    res.send(nutrition.image.data);
  } catch (error) {
    next(error);
  }
};

exports.upload = upload;
