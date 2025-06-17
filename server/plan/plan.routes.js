const express = require('express');
const router = express.Router();

const {
  calculatePlan,
  getPlan,
  getCalorieGoal, 
} = require('./plan.controller');

const authMiddleware = require('../authMiddleware');

router.post('/', authMiddleware, calculatePlan);
router.get('/', authMiddleware, getPlan);
router.get('/goals', authMiddleware, getCalorieGoal);

module.exports = router;
