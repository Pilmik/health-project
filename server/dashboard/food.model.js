const mongoose = require("mongoose");

const foodEntrySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    meal: { type: String, enum: ["breakfast", "lunch", "dinner", "snack"], required: true },
    name: { type: String, required: true },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    healthScore: { type: Number, min: 0, max: 100, default: 50 }
  }, { timestamps: true });  

module.exports = mongoose.model("FoodEntry", foodEntrySchema);
