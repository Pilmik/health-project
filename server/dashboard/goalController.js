const User = require('../models/User');
const Plan = require('../plan/plan.model');

exports.getGoalInfo = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const plan = await Plan.findOne({ userId });
    if (!user || !plan) {
      return res.status(404).json({ message: 'Користувач або план не знайдені' });
    }

    const goalType = user.goal; 
    const goalKg = user.targetWeightChange;
    const targetDate = plan.targetDate;
    const startWeight = plan.startWeight;
    const goalWeight = plan.goalWeight;
    const currentWeight = user.weight;
    const totalChangeNeeded = Math.abs(startWeight - goalWeight);
    const changeSoFar = Math.abs(startWeight - currentWeight);
    const progress = totalChangeNeeded > 0 ? Math.min(Math.round((changeSoFar / totalChangeNeeded) * 100), 100) : 0;

    res.json({
      goalType,
      goalKg,
      targetDate,
      progress
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
};
