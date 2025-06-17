const charts = {};
let selectedDate = localStorage.getItem("selectedDate") || new Date().toISOString().split("T")[0];
let statsMode = "week";

document.addEventListener("DOMContentLoaded", async () => {
const dateModal = document.getElementById("dateModal");
const dateOverlay = document.getElementById("dateModalOverlay");
const dateInput = document.getElementById("dateInput");
const openDateBtn = document.getElementById("dateSwitcherBtn");
const dateDoneBtn = document.getElementById("dateModalDone");
const dateCloseBtn = document.getElementById("dateModalClose");
const dateTodayBtn = document.getElementById("dateTodayBtn");

dateTodayBtn.addEventListener("click", async () => {
  const todayStr = new Date().toISOString().split("T")[0];
  selectedDate = todayStr;
  localStorage.setItem("selectedDate", selectedDate);
  closeDateModal();

  document.getElementById("currentDateText").innerHTML =
    "Сьогодні <i class='fi fi-rr-angle-small-down'></i>";

  await getDailySummary();
  await fetchMealCalories();
  await updateFoodSummary();
  await fetchAddedFood();
  await loadGoalInfo();
  await updateNutritionQuality(); 

  const weightRes = await fetch(`http://localhost:5000/api/dashboard/weight?date=${selectedDate}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const weight = await weightRes.json();
  currentWeight = weight.value;
  startWeight = weight.start;
  goalWeight = weight.goal;
  updateWeightUI();

  const stepsRes = await fetch(`http://localhost:5000/api/dashboard/steps?date=${selectedDate}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const steps = await stepsRes.json();
  currentSteps = steps.value;
  goalSteps = steps.goal;
  document.getElementById("stepsInput").value = currentSteps;
  document.querySelector(".steps-block .value-sub-goal").textContent = `Мета: ${goalSteps} кроків`;
  document.getElementById("stepsProgress").style.width = Math.min((currentSteps / goalSteps) * 100, 100) + "%";

  const waterRes = await fetch(`http://localhost:5000/api/dashboard/water?date=${selectedDate}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const water = await waterRes.json();
  currentWater = water.value;
  dailyWaterGoal = water.goal;
  document.getElementById("waterValue").textContent = currentWater;
  document.querySelector(".value-sub-goal").textContent = `Мета: ${dailyWaterGoal} л`;
  document.getElementById("waterProgress").style.width = Math.min((currentWater / dailyWaterGoal) * 100, 100) + "%";
});

openDateBtn.addEventListener("click", () => {
  dateInput.value = selectedDate;
  dateModal.style.display = "block";
  dateOverlay.style.display = "block";
});

function closeDateModal() {
  dateModal.style.display = "none";
  dateOverlay.style.display = "none";
}

dateOverlay.addEventListener("click", closeDateModal);
dateCloseBtn.addEventListener("click", closeDateModal);

  const token = localStorage.getItem("token");
  if (!token) {
    return window.location.href = "/login.html";
  }

const todayStr = new Date().toISOString().split("T")[0];
const isToday = selectedDate === todayStr;

document.getElementById("currentDateText").innerHTML =
  (isToday ? "Сьогодні" : new Date(selectedDate).toLocaleDateString('uk-UA')) +
  '<i class="fi fi-rr-angle-small-down"></i>';

  function createDoughnutChart(id, value, total, color) {
    const ctx = document.getElementById(id).getContext("2d");
    if (charts[id]) {
      charts[id].destroy();
    }
  
    charts[id] = new Chart(ctx, {
      type: "doughnut",
      data: {
        datasets: [{
          data: [value, total - value],
          backgroundColor: [color, "#e0e0e0"],
          borderWidth: 0
        }]
      },
      options: {
        cutout: "85%",
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });
  }

  let currentWater = 0;
  let dailyWaterGoal = 2;

  function createAreaChart(id, label, data, color = "#03A9F4", mode = "week") {
    const canvas = document.getElementById(id);
    if (!canvas) return;
  
    const ctx = canvas.getContext("2d");
    if (charts[id]) charts[id].destroy();
  
    const allLabels = Object.keys(data);
    const allValues = Object.values(data);
    const filteredLabels = mode === "month"
      ? allLabels.filter((_, i) => i === 0 || i === allLabels.length - 1)
      : allLabels;
  
    const filteredValues = mode === "month"
      ? allValues.filter((_, i) => i === 0 || i === allValues.length - 1)
      : allValues;
  
    charts[id] = new Chart(ctx, {
      type: "line",
      data: {
        labels: filteredLabels,
        datasets: [{
          label,
          data: filteredValues,
          fill: true,
          borderColor: color,
          backgroundColor: color + "33",
          tension: 0.3,
          pointRadius: 3,
          pointBackgroundColor: color
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: {
              font: { size: 10 },
              callback: function (value) {
                const label = this.getLabelForValue(value);
                const date = new Date(label);
                return date.toLocaleDateString("uk-UA", {
                  day: "2-digit",
                  month: "2-digit"
                });
              }
            }
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  function loadStatistics() {
    const token = localStorage.getItem("token");
    const activeBtn = document.querySelector(".stat-mode-switch .mode-btn.active");
    statsMode = activeBtn ? activeBtn.dataset.mode : "week";
    const mode = statsMode;
    
    fetch(`http://localhost:5000/api/statistics?mode=${mode}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

      .then((res) => res.json())
      .then((data) => {
          createAreaChart("waterChart", "Вода", data.water, "#2196F3", statsMode);
          createAreaChart("stepsChart", "Кроки", data.steps, "#4CAF50", statsMode);
          createAreaChart("weightChart", "Вага", data.weight, "#9C27B0", statsMode);
          createAreaChart("caloriesChart", "Калорії", data.calories, "#FF9800", statsMode);
          createAreaChart("nutritionQualityChart", "Якість раціону", data.nutritionQuality, "#E91E63", statsMode);
 
        if (data.topProducts) {
          const labels = Object.keys(data.topProducts).map(label => label.split(" "));
          const values = Object.values(data.topProducts);
          const ctx = document.getElementById("topProductsChart").getContext("2d");
          if (charts["topProductsChart"]) charts["topProductsChart"].destroy();
        
          const backgroundColors = [
            "rgba(255, 152, 0, 0.2)",  
            "rgba(33, 150, 243, 0.2)",  
            "rgba(156, 39, 176, 0.2)",  
            "rgba(76, 175, 80, 0.2)",   
            "rgba(244, 67, 54, 0.2)", 
            "rgba(0, 188, 212, 0.2)"  
          ];
          const borderColors = backgroundColors.map(c => c.replace("0.2", "1"));
        
          charts["topProductsChart"] = new Chart(ctx, {
            type: "bar",
            data: {
              labels,
              datasets: [{
                label: "Кількість",
                data: values,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 2,
                borderRadius: 6
              }]
            },
            options: {
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: {
                  ticks: {
                    font: { size: 10 },
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0
                  }
                },
                y: {
                  beginAtZero: true
                }
              }
            }
          });
        }

        if (data.energyBalance) {
          const dates = Object.keys(data.energyBalance);
          const eaten = dates.map(d => data.energyBalance[d].eaten);
          const burned = dates.map(d => data.energyBalance[d].burned);
          const ctx = document.getElementById("energyBalanceChart").getContext("2d");
          if (charts["energyBalanceChart"]) charts["energyBalanceChart"].destroy();
          charts["energyBalanceChart"] = new Chart(ctx, {
            type: "line",
            data: {
              labels: dates,
              datasets: [
                {
                  label: "Спожито",
                  data: eaten,
                  borderColor: "#F44336",
                  backgroundColor: "#F4433622", 
                  fill: true
                },
                {
                  label: "Спалено",
                  data: burned,
                  borderColor: "#00BCD4",
                  backgroundColor: "#00BCD422",
                  fill: true
                }
              ]
            },
            options: {
              responsive: true,
              plugins: { legend: { position: "bottom" } },
              scales: {
                x: {
                  ticks: {
                    font: { size: 10 },
                    callback: function(value, index, ticks) {
                      const label = this.getLabelForValue(value);
                      const date = new Date(label);
                      return date.toLocaleDateString("uk-UA", {
                        day: "2-digit",
                        month: "2-digit"
                      });
                    }
                  }
                },
                y: { beginAtZero: true }
              }              
            }
          });
        }
  
        if (data.macros) {
          const dates = Object.keys(data.macros);
          const carbs = dates.map(d => data.macros[d].carbs);
          const protein = dates.map(d => data.macros[d].protein);
          const fat = dates.map(d => data.macros[d].fat);
          const ctx = document.getElementById("macrosChart").getContext("2d");
          if (charts["macrosChart"]) charts["macrosChart"].destroy();
          charts["macrosChart"] = new Chart(ctx, {
            type: "line",
            data: {
              labels: dates,
              datasets: [
                { label: "Вуг-ди", data: carbs, borderColor: "#03A9F4", backgroundColor: "#03A9F433", fill: true },
                { label: "Білки", data: protein, borderColor: "#7E57C2", backgroundColor: "#7E57C233", fill: true },
                { label: "Жири", data: fat, borderColor: "#FFA726", backgroundColor: "#FFA72633", fill: true }
              ]
            },
            options: {
              responsive: true,
              plugins: { legend: { position: "bottom" } },
              scales: {
                x: {
                  ticks: {
                    font: { size: 10 },
                    callback: function(value, index, ticks) {
                      const label = this.getLabelForValue(value);
                      const date = new Date(label);
                      return date.toLocaleDateString("uk-UA", {
                        day: "2-digit",
                        month: "2-digit"
                      });
                    }
                  }
                },
                y: { beginAtZero: true }
              }              
            }
          });
        }
      })
      .catch((err) => {
      });
  }

document.querySelectorAll(".stat-mode-switch").forEach(group => {
  const chartKey = group.dataset.chart;

  group.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      group.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const mode = btn.dataset.mode;

      try {
        const res = await fetch(`http://localhost:5000/api/statistics?mode=${mode}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (chartKey === "water") {
          createAreaChart("waterChart", "Вода", data.water, "#2196F3", mode);
        } else if (chartKey === "steps") {
          createAreaChart("stepsChart", "Кроки", data.steps, "#4CAF50", mode);
        } else if (chartKey === "weight") {
          createAreaChart("weightChart", "Вага", data.weight, "#9C27B0", mode);
        } else if (chartKey === "calories") {
          createAreaChart("caloriesChart", "Калорії", data.calories, "#FF9800", mode);
        } else if (chartKey === "nutritionQuality") {
          createAreaChart("nutritionQualityChart", "Якість раціону", data.nutritionQuality, "#E91E63", mode);
        } else if (chartKey === "topProducts") {
          const labels = Object.keys(data.topProducts).map(l => l.split(" "));
          const values = Object.values(data.topProducts);
          const ctx = document.getElementById("topProductsChart").getContext("2d");
          if (charts["topProductsChart"]) charts["topProductsChart"].destroy();

          const colors = [
            "rgba(255, 152, 0, 0.2)", "rgba(33, 150, 243, 0.2)", "rgba(156, 39, 176, 0.2)",
            "rgba(76, 175, 80, 0.2)", "rgba(244, 67, 54, 0.2)"
          ];
          const borders = colors.map(c => c.replace("0.2", "1"));

          charts["topProductsChart"] = new Chart(ctx, {
            type: "bar",
            data: {
              labels,
              datasets: [{
                label: "Кількість",
                data: values,
                backgroundColor: colors,
                borderColor: borders,
                borderWidth: 2,
                borderRadius: 6
              }]
            },
            options: {
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { autoSkip: false } },
                y: { beginAtZero: true }
              }
            }
          });
        } else if (chartKey === "energyBalance") {
          const dates = Object.keys(data.energyBalance);
          const eaten = dates.map(d => data.energyBalance[d].eaten);
          const burned = dates.map(d => data.energyBalance[d].burned);
          const ctx = document.getElementById("energyBalanceChart").getContext("2d");
          if (charts["energyBalanceChart"]) charts["energyBalanceChart"].destroy();
          charts["energyBalanceChart"] = new Chart(ctx, {
            type: "line",
            data: {
              labels: mode === "month" ? [dates[0], dates[dates.length - 1]] : dates,
              datasets: [
                {
                  label: "Спожито",
                  data: mode === "month" ? [eaten[0], eaten[eaten.length - 1]] : eaten,
                  borderColor: "#F44336",
                  backgroundColor: "#F4433622",
                  fill: true
                },
                {
                  label: "Спалено",
                  data: mode === "month" ? [burned[0], burned[burned.length - 1]] : burned,
                  borderColor: "#00BCD4",
                  backgroundColor: "#00BCD422",
                  fill: true
                }
              ]
            },
            options: {
              responsive: true,
              plugins: { legend: { position: "bottom" } },
              scales: { y: { beginAtZero: true } }
            }
          });
        } else if (chartKey === "macros") {
          const dates = Object.keys(data.macros);
          const carbs = dates.map(d => data.macros[d].carbs);
          const protein = dates.map(d => data.macros[d].protein);
          const fat = dates.map(d => data.macros[d].fat);
          const ctx = document.getElementById("macrosChart").getContext("2d");
          if (charts["macrosChart"]) charts["macrosChart"].destroy();
          charts["macrosChart"] = new Chart(ctx, {
            type: "line",
            data: {
              labels: mode === "month" ? [dates[0], dates[dates.length - 1]] : dates,
              datasets: [
                { label: "Вуг-ди", data: mode === "month" ? [carbs[0], carbs[carbs.length - 1]] : carbs, borderColor: "#03A9F4", backgroundColor: "#03A9F433", fill: true },
                { label: "Білки", data: mode === "month" ? [protein[0], protein[protein.length - 1]] : protein, borderColor: "#7E57C2", backgroundColor: "#7E57C233", fill: true },
                { label: "Жири", data: mode === "month" ? [fat[0], fat[fat.length - 1]] : fat, borderColor: "#FFA726", backgroundColor: "#FFA72633", fill: true }
              ]
            },
            options: {
              responsive: true,
              plugins: { legend: { position: "bottom" } },
              scales: { y: { beginAtZero: true } }
            }
          });
        }
      } catch (err) {
      }
    });
  });
});

  async function getDailySummary() {
    try {
      const summaryRes = await fetch(`http://localhost:5000/api/dashboard/summary?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const summary = await summaryRes.json();
      const macroBars = document.querySelectorAll(".macro-bar-value");
      if (macroBars.length >= 3) {
        macroBars[0].textContent = `${summary.macros.carbs.eaten} / ${summary.macros.carbs.goal} г`;
        macroBars[1].textContent = `${summary.macros.protein.eaten} / ${summary.macros.protein.goal} г`;
        macroBars[2].textContent = `${summary.macros.fat.eaten} / ${summary.macros.fat.goal} г`;
      }
  
      document.querySelector(".macro-center-text div").textContent = summary.caloriesLeft;
      createDoughnutChart("macroRingChart", summary.caloriesEaten, summary.caloriesGoal, "#4caf50");
  
      const macroBoxes = document.querySelectorAll(".macro-box");
      if (macroBoxes.length >= 2) {
        macroBoxes[0].querySelector("p").textContent = summary.caloriesEaten;
        macroBoxes[1].querySelector("p").textContent = summary.burned;
        macroBoxes[1].querySelector("h4").textContent = summary.goal === "набір ваги" ? "Набрано" : "Спалено";
      }
    } catch (err) {
    }
  }
  
  async function changeWater(amount) {
    try {
      const res = await fetch(`http://localhost:5000/api/dashboard/water?date=${selectedDate}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ delta: amount })
      });
      const result = await res.json();
      currentWater = result.value;
      document.getElementById("waterValue").textContent = currentWater;
      document.getElementById("waterProgress").style.width = Math.min((currentWater / dailyWaterGoal) * 100, 100) + "%";
    } catch (err) {
    }
  }

  let currentSteps = 0;
  let goalSteps = 10000;

  async function changeSteps(amount) {
    try {
      const res = await fetch(`http://localhost:5000/api/dashboard/steps?date=${selectedDate}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ delta: amount })
      });
      const result = await res.json();
      currentSteps = result.value;
      document.getElementById("stepsInput").value = currentSteps;
      document.getElementById("stepsProgress").style.width = Math.min((currentSteps / goalSteps) * 100, 100) + "%";
  
      const caloriesBurned = result.burned || 0;
      const burnedBox = document.querySelectorAll(".macro-box")[1]; 
      if (burnedBox) {
        burnedBox.querySelector("p").textContent = caloriesBurned;
      }
      await getDailySummary();
    } catch (err) {
    }
  }
  
  let currentWeight = 0;
  let startWeight = 0;
  let goalWeight = 0;
  let goalType = "";
  let goalKg = 0;
  let targetDate = "";
  let goalProgress = 0;

  async function changeWeight(amount) {
    try {
      const res = await fetch(`http://localhost:5000/api/dashboard/weight?date=${selectedDate}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ delta: amount })
      });
      const result = await res.json();
      currentWeight = result.value;
      updateWeightUI();
    } catch (err) {
    }
  }

  function updateWeightUI() {
    const weightInput = document.getElementById("weightInput");
    if (weightInput) {
      weightInput.value = Number.isFinite(currentWeight) ? currentWeight.toFixed(1) : "0.0";
    }
  
    const labels = document.querySelectorAll(".weight-range-labels span");
    if (labels.length === 2) {
      labels[0].textContent = `${startWeight} кг`;
      labels[1].textContent = `${goalWeight} кг`;
    }
  
    const progress = ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100;
    const clampedProgress = Math.max(0, Math.min(100, progress));
    document.getElementById("weightProgress").style.width = `${clampedProgress}%`;
  
    createDoughnutChart("goalRingChart", clampedProgress, 100, "#4caf50");
    document.querySelector(".goal-center-text").textContent = `${Math.round(clampedProgress)}%`;
  }
  
  async function loadGoalInfo() {
    try {
      const res = await fetch("http://localhost:5000/api/dashboard/goal", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const goalData = await res.json();
  
      goalType = goalData.goalType;
      goalKg = goalData.goalKg;
      targetDate = goalData.targetDate;
      goalProgress = goalData.progress;
  
      let goalText = "";
      if (goalType.toLowerCase() === "схуднення") {
        goalText = `Схуднути на ${goalKg} кг`;
      } else if (goalType.toLowerCase() === "набір ваги") {
        goalText = `Набрати ${goalKg} кг`;
      }
      document.getElementById("goalMainText").textContent = goalText;
      document.getElementById("goalSubText").innerHTML = `Очікувана дата:<br><strong>${new Date(targetDate).toLocaleDateString('uk-UA')}</strong>`;
  
      createDoughnutChart("goalRingChart", goalProgress, 100, "#4caf50"); 
  
      document.querySelector(".goal-center-text").textContent = `${goalProgress}%`;
    } catch (err) {
    }
  }
  
  let mealCalories = {
  breakfast: 0,
  lunch: 0,
  dinner: 0,
  snack: 0,
};

  async function updateNutritionQuality() {
    try {
      const res = await fetch(`http://localhost:5000/api/dashboard/summary?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Не вдалося отримати зведення");

      const summary = await res.json();
      const quality = summary.nutritionQuality || 0;
      const indicator = document.getElementById("qualityIndicator");
      if (!indicator) return;

      indicator.style.left = `${Math.min(100, Math.max(0, quality))}%`;

      const feedback = document.getElementById("nutritionFeedback");
      if (quality >= 80) {
        feedback.textContent = "Ваш раціон сьогодні збалансований. Продовжуйте в тому ж дусі!";
      } else if (quality >= 50) {
        feedback.textContent = "Можна краще! Обирайте більше корисних продуктів.";
      } else {
        feedback.textContent = "Раціон незбалансований. Рекомендуємо звернути увагу на вибір продуктів.";
      }
    } catch (err) {
    }
  }

async function fetchMealCalories() {
  try {
    const res = await fetch("http://localhost:5000/api/plan", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const plan = await res.json();
    const total = plan.calories || 2000;

    mealCalories = {
      breakfast: Math.round(total * 0.3),
      lunch: Math.round(total * 0.35),
      dinner: Math.round(total * 0.25),
      snack: Math.round(total * 0.1),
    };

    document.querySelectorAll(".meal-block").forEach((block) => {
      const title = block.querySelector(".meal-title").textContent.trim().toLowerCase();
      const kcalEl = block.querySelector(".meal-kcal");
      if (title.includes("сніданок")) kcalEl.innerHTML = `0 / ${mealCalories.breakfast} ккал`;
      if (title.includes("обід")) kcalEl.innerHTML = `0 / ${mealCalories.lunch} ккал`;
      if (title.includes("вечеря")) kcalEl.innerHTML = `0 / ${mealCalories.dinner} ккал`;
      if (title.includes("перекус")) kcalEl.innerHTML = `0 / ${mealCalories.snack} ккал`;
    });
  } catch (e) {
  }
}

  try {
    const userRes = await fetch(`http://localhost:5000/api/dashboard/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!userRes.ok) throw new Error("Помилка авторизації");
    const user = await userRes.json();
    await fetchMealCalories();
    await updateFoodSummary();
    await loadGoalInfo(); 
    await updateNutritionQuality();
    document.getElementById("greeting-name").textContent = user.name;
    document.getElementById("profile-email").textContent = user.email;
    const gender = user.gender.toLowerCase();
    document.getElementById("avatar-icon").src =
    gender === "ж" || gender === "female" ? "Icons/girl.svg" : "Icons/man.svg";

    const summaryRes = await fetch(`http://localhost:5000/api/dashboard/summary?date=${selectedDate}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const summary = await summaryRes.json();
    const macroBars = document.querySelectorAll(".macro-bar-value");
    if (macroBars.length >= 3) {
      macroBars[0].textContent = `${summary.macros.carbs.eaten} / ${summary.macros.carbs.goal} г`;
      macroBars[1].textContent = `${summary.macros.protein.eaten} / ${summary.macros.protein.goal} г`;
      macroBars[2].textContent = `${summary.macros.fat.eaten} / ${summary.macros.fat.goal} г`;
    }

    document.querySelector(".macro-center-text div").textContent = summary.caloriesLeft;
    createDoughnutChart("macroRingChart", summary.caloriesEaten, summary.caloriesGoal, "#4caf50");

    const macroBoxes = document.querySelectorAll(".macro-box");
    if (macroBoxes.length >= 2) {
      macroBoxes[0].querySelector("p").textContent = summary.caloriesEaten;
      macroBoxes[1].querySelector("p").textContent = summary.burned;
      macroBoxes[1].querySelector("h4").textContent = summary.goal === "набір ваги" ? "Набрано" : "Спалено";
    }

    const waterRes = await fetch(`http://localhost:5000/api/dashboard/water?date=${selectedDate}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const water = await waterRes.json();
    currentWater = water.value;
    dailyWaterGoal = water.goal;
    document.getElementById("waterValue").textContent = currentWater;
    document.querySelector(".value-sub-goal").textContent = `Мета: ${dailyWaterGoal} л`;
    document.getElementById("waterProgress").style.width = Math.min((currentWater / dailyWaterGoal) * 100, 100) + "%";

    const stepsRes = await fetch(`http://localhost:5000/api/dashboard/steps?date=${selectedDate}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const steps = await stepsRes.json();
    currentSteps = steps.value;
    goalSteps = steps.goal;
    document.getElementById("stepsInput").value = currentSteps;
    document.querySelector(".steps-block .value-sub-goal").textContent = `Мета: ${goalSteps} кроків`;
    document.getElementById("stepsProgress").style.width = Math.min((currentSteps / goalSteps) * 100, 100) + "%";

    const weightRes = await fetch(`http://localhost:5000/api/dashboard/weight?date=${selectedDate}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const weight = await weightRes.json();
    currentWeight = weight.value;
    startWeight = weight.start;
    goalWeight = weight.goal;
    updateWeightUI();
  } catch (err) {
  }

  document.getElementById("waterMinusBtn").addEventListener("click", () => changeWater(-0.1));
  document.getElementById("waterPlusBtn").addEventListener("click", () => changeWater(0.1));
  document.getElementById("stepsMinusBtn").addEventListener("click", () => changeSteps(-100));
  document.getElementById("stepsPlusBtn").addEventListener("click", () => changeSteps(100));
  document.getElementById("stepsInput").addEventListener("input", async (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      const delta = value - currentSteps;
      await changeSteps(delta);
      await getDailySummary();
    }
  });
  document.getElementById("weightMinusBtn").addEventListener("click", () => changeWeight(-1.0));
  document.getElementById("weightPlusBtn").addEventListener("click", () => changeWeight(1.0));
  document.getElementById("weightInput").addEventListener("input", async (e) => {

  const value = parseFloat(e.target.value);
  if (!isNaN(value)) {
    const delta = value - currentWeight;
    await changeWeight(delta);
  }
});

  const modal = document.getElementById("foodModal");
  const overlay = document.getElementById("foodModalOverlay");
  const closeBtn = document.getElementById("foodModalClose");
  const openButtons = document.querySelectorAll(".meal-add");

  let selectedMeal = "breakfast";
  let addedFood = [];
  const foodInput = document.querySelector(".modal-search");
  const resultsList = document.getElementById("foodSearchResults");
  const mealTitles = {
    breakfast: "Сніданок",
    lunch: "Обід",
    dinner: "Вечеря",
    snack: "Перекуси"
  };
  
  openButtons.forEach((btn, index) => {
    btn.addEventListener("click", async () => {
      const meals = ["breakfast", "lunch", "dinner", "snack"];
      selectedMeal = meals[index];
  
      document.querySelector("#foodModal h3").textContent = mealTitles[selectedMeal];
  
      modal.style.display = "block";
      overlay.style.display = "block";
  
      foodInput.value = "";
      resultsList.innerHTML = "";
  
      const today = selectedDate;

      try {
        const addedRes = await fetch(`http://localhost:5000/api/dashboard/food?date=${today}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!addedRes.ok) throw new Error("Не вдалося завантажити додану їжу");
        addedFood = await addedRes.json();
        updateAddedFoodUI();
      } catch (err) {
      }
    });
  });  

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    overlay.style.display = "none";
  });

  overlay.addEventListener("click", () => {
    modal.style.display = "none";
    overlay.style.display = "none";
  });
  
  foodInput.addEventListener("keyup", async (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (query.length < 2) return;
  
    const today = selectedDate;
    try {
      resultsList.innerHTML = "";
  
      const localRes = await fetch("http://localhost:5000/api/dashboard/food/local");
      const localData = await localRes.json();
  
      for (const section in localData) {
        const matches = localData[section].filter(food =>
          food.name.toLowerCase().includes(query)
        );
  
        matches.forEach((food) => {
          const li = document.createElement("li");
  
          const left = document.createElement("div");
          left.classList.add("modal-item-left");
          left.innerHTML = `
            <strong>${food.name}</strong>
            <small>${food.per} ${food.unit}</small>`;
  
          const right = document.createElement("div");
          right.classList.add("modal-item-right");
  
          const kcal = document.createElement("span");
          kcal.textContent = `${Math.round(food.calories)} ккал`;
          kcal.style.opacity = "0.6";
  
          const addBtn = document.createElement("button");
          addBtn.classList.add("modal-add-btn");
          addBtn.textContent = "+";
  
          addBtn.addEventListener("click", async () => {
            await fetch(`http://localhost:5000/api/dashboard/food?date=${selectedDate}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                date: today,
                meal: selectedMeal,
                query: food.name
              })
            });
  
            await updateFoodSummary();
            await updateNutritionQuality();
            
            const addedRes = await fetch(`http://localhost:5000/api/dashboard/food?date=${today}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            addedFood = await addedRes.json();
            updateAddedFoodUI();
          });
  
          right.appendChild(kcal);
          right.appendChild(addBtn);
  
          li.appendChild(left);
          li.appendChild(right);
          resultsList.appendChild(li);
        });
      }

      const addedRes = await fetch(`http://localhost:5000/api/dashboard/food?date=${today}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addedFood = await addedRes.json();
      updateAddedFoodUI(); 
  
    } catch (err) {
    }
  });

  function updateAddedFoodUI() {
    const container = document.getElementById("addedFoodList");
    if (!container) return;
  
    container.innerHTML = "";
  
    addedFood
      .filter(f => f.meal === selectedMeal)
      .forEach((item) => {
        const li = document.createElement("li");
        li.classList.add("modal-added-item");
  
        const left = document.createElement("div");
        left.classList.add("modal-item-left");
        left.innerHTML = `
          <strong>${item.name}</strong>
          <small>${item.calories} ккал</small>`;
  
        const right = document.createElement("div");
        right.classList.add("modal-item-right");
  
        const removeBtn = document.createElement("button");
        removeBtn.classList.add("modal-remove-btn");
        removeBtn.innerHTML = '<i class="fi fi-rr-trash"></i>';
        removeBtn.style.backgroundColor = "#f44336";
        removeBtn.style.color = "white";
  
        removeBtn.addEventListener("click", async () => {
          try {
            const res = await fetch(`http://localhost:5000/api/dashboard/food/${item._id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
  
            if (!res.ok) throw new Error("Не вдалося видалити продукт");
  
            // Видаляємо тільки з поточного прийому
            addedFood = addedFood.filter(f => f._id !== item._id);
            updateAddedFoodUI();
            await updateFoodSummary();
            await updateNutritionQuality();
          } catch (err) {
          }
        });
  
        right.appendChild(removeBtn);
        li.appendChild(left);
        li.appendChild(right);
        container.appendChild(li);
      });
  }    

  document.querySelector(".modal-done-btn").addEventListener("click", () => {
    foodInput.value = "";
    modal.style.display = "none";
    overlay.style.display = "none";
  });
  
  async function updateFoodSummary() {
    try {
      const res = await fetch(`http://localhost:5000/api/dashboard/food/summary?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const summary = await res.json();      

      const totalPlan = await fetch("http://localhost:5000/api/plan", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const plan = await totalPlan.json();
      const carbsPercent = Math.min((summary.carbs / plan.carbGrams) * 100, 100);
      const proteinPercent = Math.min((summary.protein / plan.proteinGrams) * 100, 100);
      const fatPercent = Math.min((summary.fat / plan.fatGrams) * 100, 100);
      const macroBars = document.querySelectorAll(".macro-bar");
      const macroValues = document.querySelectorAll(".macro-bar-value");
      if (macroBars.length >= 3 && macroValues.length >= 3) {
        macroBars[0].firstElementChild.style.width = `${carbsPercent}%`;
        macroBars[1].firstElementChild.style.width = `${proteinPercent}%`;
        macroBars[2].firstElementChild.style.width = `${fatPercent}%`;
        macroValues[0].textContent = `${summary.carbs} / ${plan.carbGrams} г`;
        macroValues[1].textContent = `${summary.protein} / ${plan.proteinGrams} г`;
        macroValues[2].textContent = `${summary.fat} / ${plan.fatGrams} г`;
      }
  
      document.querySelector(".macro-center-text div").textContent = Math.max(plan.calories - summary.calories, 0);
      createDoughnutChart("macroRingChart", summary.calories, plan.calories, "#4caf50");
  
      const h4s = document.querySelectorAll(".macro-box h4");
      h4s.forEach(h4 => {
        if (h4.textContent.includes("Спожито")) {
          const eatenBox = h4.parentElement;
          eatenBox.querySelector("p").textContent = Math.round(summary.calories);
        }
      });

      const mealMap = {
        breakfast: "сніданок",
        lunch: "обід",
        dinner: "вечеря",
        snack: "перекус"
      };
  
      document.querySelectorAll(".meal-block").forEach((block) => {
        const title = block.querySelector(".meal-title").textContent.trim().toLowerCase();
        const kcalEl = block.querySelector(".meal-kcal");
        for (const key in summary.meals) {
          if (title.includes(mealMap[key])) {
            const max = mealCalories[key];
            const val = summary.meals[key] || 0;
            kcalEl.textContent = `${val} / ${max} ккал`;
          }
        }
      });
  
    } catch (err) {
    }
  }  

  async function fetchAddedFood() {
    try {
      const res = await fetch(`http://localhost:5000/api/dashboard/food?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Не вдалося отримати список їжі");
      addedFood = await res.json();
      updateAddedFoodUI();
    } catch (err) {
    }
  }
  
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const toggleBtn = document.getElementById("sidebarToggle");
  const icon = document.getElementById("toggleIcon");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");
    icon.classList.toggle("fi-rr-angle-left");
    icon.classList.toggle("fi-rr-angle-right");
  });

  const navLinks = document.querySelectorAll(".sidebar-nav a");
  navLinks.forEach((link) => {
  link.addEventListener("click", function () {
    navLinks.forEach((l) => l.classList.remove("active"));
    this.classList.add("active");

    document.querySelector(".content-wrapper").classList.remove("wide-statistics");
  });
});

  document.getElementById("statisticsLink").addEventListener("click", async (e) => {
    e.preventDefault();
    document.querySelectorAll(".topbar, .top-row, .section-user-progress, .section-meals").forEach(el => {
      el.style.display = "none";
    });
  
    const wrapper = document.querySelector(".content-wrapper");
    wrapper.classList.add("wide-statistics");
    document.getElementById("mainContent").classList.add("statistics-mode");
    document.querySelector(".main-content").classList.add("statistics-mode");
    document.getElementById("statisticsView").style.display = "block";
    setTimeout(() => {
      loadStatistics();
    }, 0);
  });
  
  dateDoneBtn.addEventListener("click", async () => {
    selectedDate = dateInput.value;
    localStorage.setItem("selectedDate", selectedDate);
    closeDateModal();
  
const todayStr = new Date().toISOString().split("T")[0];
const isToday = selectedDate === todayStr;

document.getElementById("currentDateText").innerHTML =
  (isToday ? "Сьогодні" : new Date(selectedDate).toLocaleDateString('uk-UA')) +
  '<i class="fi fi-rr-angle-small-down"></i>';

    await getDailySummary(); 
    await fetchMealCalories(); 
    await updateFoodSummary();  
    await fetchAddedFood();  
    await loadGoalInfo(); 
    await updateNutritionQuality();
  
    const weightRes = await fetch(`http://localhost:5000/api/dashboard/weight?date=${selectedDate}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const weight = await weightRes.json();
    currentWeight = weight.value;
    startWeight = weight.start;
    goalWeight = weight.goal;
    updateWeightUI();
  
    const stepsRes = await fetch(`http://localhost:5000/api/dashboard/steps?date=${selectedDate}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const steps = await stepsRes.json();
    currentSteps = steps.value;
    goalSteps = steps.goal;
    document.getElementById("stepsInput").value = currentSteps;
    document.querySelector(".steps-block .value-sub-goal").textContent = `Мета: ${goalSteps} кроків`;
    document.getElementById("stepsProgress").style.width = Math.min((currentSteps / goalSteps) * 100, 100) + "%";
  
    const waterRes = await fetch(`http://localhost:5000/api/dashboard/water?date=${selectedDate}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const water = await waterRes.json();
    currentWater = water.value;
    dailyWaterGoal = water.goal;
    document.getElementById("waterValue").textContent = currentWater;
    document.querySelector(".value-sub-goal").textContent = `Мета: ${dailyWaterGoal} л`;
    document.getElementById("waterProgress").style.width = Math.min((currentWater / dailyWaterGoal) * 100, 100) + "%";
  });
});