const User = require('../models/User');
const Plan = require('../plan/plan.model');
const Progress = require('./progress.model');

const getUserInfo = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    res.json({
      name: user.nickname,
      email: user.email,
      gender: user.gender
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

const getDailySummary = async (req, res) => {
  try {
    const userId = req.userId;
    const today = req.query.date || new Date().toISOString().split("T")[0];
    const plan = await Plan.findOne({ userId });
    if (!plan) return res.status(404).json({ message: "План не знайдено" });

    let progress = await Progress.findOne({ userId, date: today });
    if (!progress) progress = await Progress.create({ userId, date: today });

    const caloriesGoal = Math.round(plan.calories);
    const caloriesEaten = Math.round(progress.caloriesEaten);
    const caloriesLeft = Math.max(0, caloriesGoal - caloriesEaten);
    const steps = progress.steps;
    const burned = Math.round(steps * 0.04);
    const macros = {
      protein: {
        goal: Math.round(plan.proteinGrams * 10) / 10,
        eaten: Math.round(progress.proteinEaten * 10) / 10
      },
      fat: {
        goal: Math.round(plan.fatGrams * 10) / 10,
        eaten: Math.round(progress.fatEaten * 10) / 10
      },
      carbs: {
        goal: Math.round(plan.carbGrams * 10) / 10,
        eaten: Math.round(progress.carbsEaten * 10) / 10
      }      
    };

    res.json({
      caloriesGoal,
      caloriesEaten,
      caloriesLeft,
      macros,
      burned,
      goal: plan.goal,
      nutritionQuality: progress.nutritionQuality || 0
    });
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
};

const getWater = async (req, res) => {
  try {
    const userId = req.userId;
    const today = req.query.date || new Date().toISOString().split("T")[0];
    const plan = await Plan.findOne({ userId });
    if (!plan) return res.status(404).json({ message: "План не знайдено" });

    let progress = await Progress.findOne({ userId, date: today });
    if (!progress) progress = await Progress.create({ userId, date: today });

    res.json({
      goal: Math.round(plan.waterLiters * 10) / 10,
      value: Math.round(progress.water * 10) / 10
    });
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
};

const updateWater = async (req, res) => {
  try {
    const userId = req.userId;
    const { delta } = req.body;
    const today = req.query.date || new Date().toISOString().split("T")[0];
    const plan = await Plan.findOne({ userId });
    if (!plan) return res.status(404).json({ message: "План не знайдено" });

    let progress = await Progress.findOne({ userId, date: today });
    if (!progress) progress = await Progress.create({ userId, date: today });

    const newValue = Math.max(0, Math.min(plan.waterLiters, Math.round((progress.water + delta) * 10) / 10));
    progress.water = newValue;
    await progress.save();

    res.json({ value: newValue });
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
};

const getSteps = async (req, res) => {
  try {
    const userId = req.userId;
    const today = req.query.date || new Date().toISOString().split("T")[0];
    const plan = await Plan.findOne({ userId });
    if (!plan) return res.status(404).json({ message: "План не знайдено" });

    let progress = await Progress.findOne({ userId, date: today });
    if (!progress) progress = await Progress.create({ userId, date: today });

    res.json({
      value: progress.steps,
      goal: plan.stepsPerDay
    });      
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
};

const updateSteps = async (req, res) => {
  try {
    const userId = req.userId;
    const { delta } = req.body;
    const today = req.query.date || new Date().toISOString().split("T")[0];

    let progress = await Progress.findOne({ userId, date: today });
    if (!progress) progress = await Progress.create({ userId, date: today });

    progress.steps = Math.max(0, progress.steps + delta);
    progress.caloriesBurned = Math.round(progress.steps * 0.04);

    await progress.save();

    res.json({ value: progress.steps });
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
};

const getWeight = async (req, res) => {
  try {
    const userId = req.userId;
    const today = req.query.date || new Date().toISOString().split("T")[0];
    const plan = await Plan.findOne({ userId });
    if (!plan) return res.status(404).json({ message: "План не знайдено" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Користувач не знайдений" });

    let progress = await Progress.findOne({ userId, date: today });
    if (!progress) progress = await Progress.create({ userId, date: today });

    const current = typeof progress.weight === 'number' ? progress.weight : user.weight || 70;

    res.json({
      value: Math.round(current * 10) / 10,
      start: Math.round((user.weight || 70) * 10) / 10,
      goal: Math.round(plan.targetWeight * 10) / 10
    });
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
};

const updateWeight = async (req, res) => {
  try {
    const userId = req.userId;
    const { delta } = req.body;
    const today = req.query.date || new Date().toISOString().split("T")[0];
    if (typeof delta !== 'number' || isNaN(delta)) {
      return res.status(400).json({ message: "Недійсне значення зміни ваги" });
    }

    const plan = await Plan.findOne({ userId });
    if (!plan) return res.status(404).json({ message: "План не знайдено" });

    let progress = await Progress.findOne({ userId, date: today });
    if (!progress) {
      progress = await Progress.create({
        userId,
        date: today,
        weight: typeof plan.startWeight === 'number' ? plan.startWeight : 70
      });
    }

    const currentWeight = typeof progress.weight === 'number' ? progress.weight : (typeof plan.startWeight === 'number' ? plan.startWeight : 70);
    const raw = currentWeight + delta;

    if (isNaN(raw)) {
      return res.status(400).json({ message: "Розрахунок дав некоректне значення ваги" });
    }

    const newValue = Math.round(raw * 10) / 10;
    progress.weight = newValue;
    await progress.save();

    res.json({
      value: newValue,
      start: Math.round(plan.startWeight * 10) / 10,
      goal: Math.round(plan.goalWeight * 10) / 10
    });
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
};

module.exports = {
  getUserInfo,
  getDailySummary,
  getWater,
  updateWater,
  getSteps,
  updateSteps,
  getWeight,
  updateWeight
};
