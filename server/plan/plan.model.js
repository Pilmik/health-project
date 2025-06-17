const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, 
  },
  targetWeight: {
    type: Number, 
    required: true,
  },
  durationWeeks: {
    type: Number, 
    required: true,
  },
  targetDate: {
    type: Date, 
    required: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  proteinGrams: {
    type: Number,
    required: true,
  },
  fatGrams: {
    type: Number,
    required: true,
  },
  carbGrams: {
    type: Number,
    required: true,
  },
  waterLiters: {
    type: Number,
    required: true,
  },
  stepsPerDay: {
    type: Number,
    required: true,
  },
  mealsPerDay: {
    type: Number,
    required: true,
  },

  startWeight: {
    type: Number,
    required: true,
  },
  goalWeight: {
    type: Number,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Plan', planSchema);
