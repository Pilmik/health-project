const Plan = require('./plan.model');
const User = require('../models/User');

const calculatePlan = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    const {
      birthDate, weight, height, gender, mealsPerDay,
      lifestyle, goal, targetWeightChange, caloriesPerDay
    } = user;

    const currentYear = new Date().getFullYear();
    const birthYear = new Date(birthDate).getFullYear();
    const age = currentYear - birthYear;

    const BMR = gender === 'Чоловік'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

    const activityFactors = {
      'сидячий': 1.2,
      'помірно активний': 1.375,
      'активний': 1.55
    };
    const activityFactor = activityFactors[lifestyle] || 1.2;
    const TDEE = BMR * activityFactor;

    let calorieGoal = TDEE;
    let weeksToGoal = null;
    let targetWeight = weight;

if (goal === 'схуднення' || goal === 'набір ваги') {
  let kcalChangePerWeek = caloriesPerDay || 3850;

  if (kcalChangePerWeek > 7000) {
    kcalChangePerWeek = 7000;
  }

  const rawKcalPerDay = kcalChangePerWeek / 7;
  const kcalPerDay = Math.min(rawKcalPerDay, 1000); 

  const MIN_CALORIES = gender === 'Чоловік' ? 1500 : 1200;

  calorieGoal = goal === 'схуднення'
    ? Math.max(TDEE - kcalPerDay, MIN_CALORIES)
    : TDEE + kcalPerDay;

  weeksToGoal = Math.ceil(Math.abs(targetWeightChange) / 0.45);

  targetWeight = goal === 'схуднення'
    ? weight - Math.abs(targetWeightChange)
    : weight + Math.abs(targetWeightChange);
}

    const proteinGrams = Math.round((calorieGoal * 0.25) / 4);
    const fatGrams = Math.round((calorieGoal * 0.25) / 9);
    const carbGrams = Math.round((calorieGoal * 0.5) / 4);

    const baseWater = weight * 0.035;
    const waterLiters = +Math.max(1.5, Math.min(baseWater, 4)).toFixed(1);

    const stepsByLifestyle = {
      'сидячий': 4000,
      'помірно активний': 7000,
      'активний': 10000
    };
    const stepsPerDay = stepsByLifestyle[lifestyle] || 4000;

    let targetDate = null;
    
    if (weeksToGoal) {
      targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + weeksToGoal * 7);
    }

    const existingPlan = await Plan.findOne({ userId });
    const planData = {
      userId,
      startWeight: weight, 
      goalWeight: targetWeight,
      targetWeight,  
      durationWeeks: weeksToGoal,
      targetDate,
      calories: Math.round(calorieGoal),
      proteinGrams,
      fatGrams,
      carbGrams,
      waterLiters,
      stepsPerDay,
      mealsPerDay
    };      

    const savedPlan = existingPlan
      ? await Plan.findOneAndUpdate({ userId }, planData, { new: true })
      : await Plan.create(planData);

    res.status(200).json(savedPlan);

  } catch (error) {
    res.status(500).json({ message: 'Щось пішло не так при створенні плану' });
  }
};

const getPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const plan = await Plan.findOne({ userId });
    if (!plan) {
      return res.status(404).json({ message: "План не знайдено" });
    }

    res.status(200).json(plan);

  } catch (err) {
    res.status(500).json({ message: "Щось пішло не так при отриманні плану" });
  }
};

const getCalorieGoal = async (req, res) => {
  try {
    const userId = req.userId;
    const plan = await Plan.findOne({ userId });
    if (!plan) {
      return res.status(404).json({ message: "План не знайдено" });
    }

    res.status(200).json({ calories: plan.calories });
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера" });
  }
};

module.exports = { calculatePlan, getPlan, getCalorieGoal };

