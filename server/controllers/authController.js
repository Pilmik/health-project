const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function isGoalRequiringChange(goal) {
  return goal === "схуднення" || goal === "набір ваги";
}

const registerUser = async (req, res) => {
  try {
    const {
      nickname,
      email,
      password,
      birthDate,
      weight,
      height,
      gender,
      mealsPerDay,
      lifestyle,
      goal,
      targetWeightChange,
      caloriesPerDay
    } = req.body;

    if (!gender) {
      return res.status(400).json({ message: "Поле 'стать' є обов'язковим." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Користувач з такою поштою вже існує" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      nickname,
      email,
      password: hashedPassword,
      birthDate,
      weight,
      height,
      gender,
      mealsPerDay,
      lifestyle,
      goal,
      targetWeightChange: isGoalRequiringChange(goal) ? targetWeightChange : null,
      caloriesPerDay: isGoalRequiringChange(goal) ? caloriesPerDay : null
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      nickname: newUser.nickname,
      email: newUser.email,
      gender: newUser.gender
    });    

  } catch (error) {
    res.status(500).json({ message: "Щось пішло не так..." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Користувача не знайдено" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Невірний пароль" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      nickname: user.nickname,
      email: user.email,
      gender: user.gender
    });
    
  } catch (error) {
    res.status(500).json({ message: "Щось пішло не так..." });
  }
};

module.exports = {
  registerUser,
  loginUser
};
