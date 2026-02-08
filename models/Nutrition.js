const mongoose = require('mongoose');

const NutritionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dish: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    portion_estimate: { type: String },
    image: {
        data: Buffer,
        contentType: String
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Nutrition', NutritionSchema);