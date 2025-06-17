const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: String, 
    required: true
  },
  caloriesEaten: {
    type: Number,
    default: 0
  },
  proteinEaten: {
    type: Number,
    default: 0
  },
  fatEaten: {
    type: Number,
    default: 0
  },
  carbsEaten: {
    type: Number,
    default: 0
  },
  steps: {
    type: Number,
    default: 0
  },
  weight: {
    type: Number,
    default: 0,
    set: v => Math.round(v * 10) / 10
  },
  water: {
    type: Number,
    default: 0,
    set: v => Math.round(v * 10) / 10
  },
  nutritionQuality: { type: Number, min: 0, max: 100, default: 0 } 
}, { timestamps: true });

module.exports = mongoose.model("Progress", progressSchema);

