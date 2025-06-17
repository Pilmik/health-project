const express = require("express");
const router = express.Router();
const auth = require("../authMiddleware");
const { getStatisticsData } = require("./statistics.controller");

router.get("/", auth, getStatisticsData);
   

module.exports = router; 
