const FoodEntry = require("./food.model");
const Progress = require("../dashboard/progress.model");
const path = require("path");
const fs = require("fs");

const addFood = async (req, res) => {
  try {
    const userId = req.userId;
    const { date, meal, query } = req.body;
    if (!userId || !date || !meal || !query) {
      return res.status(400).json({ message: "Некоректні дані для додавання продукту" });
    }

    const filePath = path.join(__dirname, "..", "data", "foodData.json");
    const foodData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    let foundItem = null;

    for (const section in foodData) {
      const match = foodData[section].find(
        item => item.name.toLowerCase() === query.toLowerCase()
      );
      if (match) {
        foundItem = match;
        break;
      }
    }

    if (!foundItem) {
      return res.status(404).json({ message: "Продукт не знайдено в базі" });
    }

    const food = await FoodEntry.create({
      userId,
      date,
      meal,
      name: foundItem.name,
      calories: foundItem.calories,
      protein: foundItem.protein,
      fat: foundItem.fat,
      carbs: foundItem.carbs,
      healthScore: foundItem.healthScore || 50
    });

    let progress = await Progress.findOne({ userId, date });
    if (!progress) progress = await Progress.create({ userId, date });

    progress.caloriesEaten += foundItem.calories || 0;
    progress.proteinEaten  += foundItem.protein  || 0;
    progress.fatEaten      += foundItem.fat      || 0;
    progress.carbsEaten    += foundItem.carbs    || 0;

    const allEntries = await FoodEntry.find({ userId, date });
    const scores = allEntries.map(item => item.healthScore || 50);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    progress.nutritionQuality = avgScore;

    await progress.save();

    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: "Не вдалося додати їжу" });
  }
};

const getFoodByDate = async (req, res) => {
  try {
    const userId = req.userId;
    const date = req.query.date;
    const food = await FoodEntry.find({ userId, date });
    res.status(200).json(food);
  } catch (error) {
    res.status(500).json({ message: "Не вдалося отримати їжу" });
  }
};

const getFoodData = (req, res) => {
  try {
    const filePath = path.join(__dirname, "..", "data", "foodData.json");
    const data = fs.readFileSync(filePath, "utf-8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ message: "Не вдалося отримати дані з файлу" });
  }
};

const getFoodSummary = async (req, res) => {
  try {
    const userId = req.userId;
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const entries = await FoodEntry.find({ userId, date });
    const summary = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      meals: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 }
    };

    entries.forEach(item => {
      summary.calories += item.calories || 0;
      summary.protein += item.protein || 0;
      summary.fat += item.fat || 0;
      summary.carbs += item.carbs || 0;
      if (item.meal && summary.meals[item.meal] !== undefined) {
        summary.meals[item.meal] += item.calories || 0;
      }
    });

    res.json({
      calories: +summary.calories.toFixed(1),
      protein: +summary.protein.toFixed(1),
      fat: +summary.fat.toFixed(1),
      carbs: +summary.carbs.toFixed(1),
      meals: summary.meals
    });          
  } catch (err) {
    res.status(500).json({ message: "Не вдалося отримати зведення" });
  }
};

const deleteFoodEntry = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const food = await FoodEntry.findOne({ _id: id, userId });
    if (!food) {
      return res.status(404).json({ message: "Запис не знайдено" });
    }

    const { date, calories, protein, fat, carbs } = food;

    await FoodEntry.deleteOne({ _id: id });

    let progress = await Progress.findOne({ userId, date });
    if (!progress) progress = await Progress.create({ userId, date });

    progress.caloriesEaten = Math.max(0, progress.caloriesEaten - (calories || 0));
    progress.proteinEaten = Math.max(0, progress.proteinEaten - (protein || 0));
    progress.fatEaten     = Math.max(0, progress.fatEaten - (fat || 0));
    progress.carbsEaten   = Math.max(0, progress.carbsEaten - (carbs || 0));
    
    const remainingEntries = await FoodEntry.find({ userId, date });
    const scores = remainingEntries.map(item => item.healthScore || 50);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    
    progress.nutritionQuality = avgScore;

    await progress.save();
    res.json({ message: "Продукт видалено" });
  } catch (error) {
    res.status(500).json({ message: "Не вдалося видалити продукт" });
  }
};

module.exports = {
  addFood,
  getFoodByDate,
  getFoodData,
  getFoodSummary,
  deleteFoodEntry
};

