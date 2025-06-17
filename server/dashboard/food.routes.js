const express = require("express");
const router = express.Router();
const {
  addFood,
  getFoodByDate,
  getFoodData,
  getFoodSummary,
  deleteFoodEntry, 
} = require("./food.controller");

router.post("/", addFood);
router.get("/", getFoodByDate);
router.get("/local", getFoodData);
router.get("/summary", getFoodSummary);
router.delete("/:id", deleteFoodEntry);

module.exports = router;
