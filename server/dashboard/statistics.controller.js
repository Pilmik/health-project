const Progress = require("../dashboard/progress.model");
const FoodEntry = require("../dashboard/food.model");
const getStatisticsData = async (req, res) => {
  try {
    const userId = req.userId;
    let progresses = await Progress.find({ userId }).sort({ date: 1 });

const mode = req.query.mode || "week";
if (mode === "week" && progresses.length > 7) {
  progresses = progresses.slice(-7);
} else if (mode === "month" && progresses.length > 30) {
  progresses = progresses.slice(-30);
}

    const foodEntries = await FoodEntry.find({ userId });
    const water = {};
    const steps = {};
    const weight = {};
    const nutritionQuality = {};
    const energyBalance = {};
    const macros = {};

    progresses.forEach(p => {
        const date = p.date;
        if (!water[date]) water[date] = [];
        water[date].push(p.water);
        if (!steps[date]) steps[date] = [];
        steps[date].push(p.steps);
        weight[date] = p.weight;
        nutritionQuality[date] = p.nutritionQuality || 0;
      
        const caloriesEaten = p.caloriesEaten || 0;
        const caloriesBurned = typeof p.caloriesBurned === 'number' ? p.caloriesBurned : Math.round(p.steps * 0.04);
        energyBalance[date] = {
          eaten: caloriesEaten,
          burned: caloriesBurned
        };
      
        macros[date] = {
          carbs: p.carbsEaten || 0,
          protein: p.proteinEaten || 0,
          fat: p.fatEaten || 0
        };
      });
      
    const avgWater = {};
    const avgSteps = {};
    for (const date in water) {
      const values = water[date];
      avgWater[date] = +(values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
    }
    for (const date in steps) {
      const values = steps[date];
      avgSteps[date] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    }

    const calories = {};
    foodEntries.forEach(entry => {
      const date = new Date(entry.date).toISOString().split("T")[0];
      calories[date] = (calories[date] || 0) + Math.round(entry.calories || 0);
    });

    const productMap = {};
    foodEntries.forEach(entry => {
      const name = entry.name;
      productMap[name] = (productMap[name] || 0) + 1;
    });

    const sorted = Object.entries(productMap).sort((a, b) => b[1] - a[1]);
    const topProducts = {};
    sorted.slice(0, 5).forEach(([name, count]) => {
      topProducts[name] = count;
    });

    res.status(200).json({
      water: avgWater,
      steps: avgSteps,
      weight,
      calories,
      nutritionQuality,
      topProducts,
      energyBalance,
      macros
    });

  } catch (err) {
    res.status(500).json({ message: "Помилка при обробці статистики" });
  }
};

module.exports = { getStatisticsData };
