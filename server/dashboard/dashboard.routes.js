const express = require('express');
const router = express.Router();

const {
  getUserInfo,
  getDailySummary,
  getWater,
  updateWater,
  getSteps,
  updateSteps,
  getWeight,
  updateWeight
} = require('./dashboard.controller');

const {
  getFoodData,
  addFood,
  getFoodByDate,
  getFoodSummary,
  deleteFoodEntry
} = require('./food.controller');

const authMiddleware = require('../authMiddleware');

router.get('/food/local', getFoodData);
router.get('/user', authMiddleware, getUserInfo);
router.get('/summary', authMiddleware, getDailySummary);
router.get('/water', authMiddleware, getWater);
router.post('/water', authMiddleware, updateWater);
router.get('/steps', authMiddleware, getSteps);
router.post('/steps', authMiddleware, updateSteps);
router.get('/weight', authMiddleware, getWeight);
router.post('/weight', authMiddleware, updateWeight);
router.post('/food', authMiddleware, addFood);
router.get('/food', authMiddleware, getFoodByDate);
router.get('/food/summary', authMiddleware, getFoodSummary);
router.delete('/food/:id', authMiddleware, deleteFoodEntry);

module.exports = router;
