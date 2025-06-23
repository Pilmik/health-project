const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");

const planRoutes = require("./server/plan/plan.routes.js");
const authRoutes = require("./server/routes/authRoutes.js");
const goalRoutes = require("./server/dashboard/goalRoutes.js");
const foodRoutes = require("./server/dashboard/food.routes.js");
const dashboardRoutes = require("./server/dashboard/dashboard.routes.js");
const statisticsRoutes = require("./server/dashboard/statistics.routes.js");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const path = require("path");
app.use(express.static(path.join(__dirname, "client")));
app.use("/Icons", express.static(path.join(__dirname, "client/Icons")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/auth", authRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dashboard/food", foodRoutes);
app.use("/api/dashboard/goal", goalRoutes);
app.use("/api/statistics", statisticsRoutes);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    const server = app.listen(process.env.PORT, () => console.log("Сервер запущено на порті " + process.env.PORT))
    process.on("SIGINT", async () => {
            console.log("Закриття сервера...");
            server.close(() => {
                console.log("Сервер зупинено");
                process.exit(0);
            });
        });
  }catch (e) {
    console.log("Помилка: " + e)
  }
}

start();
