const express = require('express');
const router = express.Router();
const { getGoalInfo } = require('./goalController');
const authMiddleware = require('../authMiddleware');

router.get('/', authMiddleware, getGoalInfo);

module.exports = router;
