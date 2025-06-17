const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },    
  mealsPerDay: {
    type: Number,
    required: true,
  },
  lifestyle: {
    type: String,
    enum: ["сидячий", "помірно активний", "активний"],
    required: true,
  },
  goal: {
    type: String,
    enum: ["схуднення", "набір ваги"], 
    required: true
  },
  targetWeightChange: {
    type: Number,
    required: function () {
      return this.goal === "схуднення" || this.goal === "набір ваги";
    },
  },
  caloriesPerDay: {
    type: Number,
    required: function () {
      return this.goal === "схуднення" || this.goal === "набір ваги";
    },
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
