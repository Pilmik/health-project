const form = document.getElementById("registerForm");
const steps = document.querySelectorAll(".step");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const progressFill = document.getElementById("progress-fill");
const goalSelect = document.getElementById("goal");
const weightActionSpan = document.getElementById("weightActionWord");
const caloriesTitle = document.getElementById("caloriesTitle");
const caloriesDesc = document.getElementById("caloriesDesc");

let currentStep = 0;
let passwordStrengthScore = 0;
let gender;
const TOTAL_STEPS = steps.length;

function isWeightChangeGoal() {
  const goal = goalSelect.value;
  return goal === "схуднення" || goal === "набір ваги";
}

function getVisibleSteps() {
  return Array.from(steps).filter((step, index) => {
    if (index === 8 || index === 9) {
      return isWeightChangeGoal();
    }
    return true;
  });
}

function showError(stepIndex, message) {
  const step = steps[stepIndex];
  let errorEl = step.querySelector(".error-message");
  if (!errorEl) {
    errorEl = document.createElement("div");
    errorEl.classList.add("error-message");
    const input = step.querySelector("input, select");
    if (input && input.parentNode) {
      input.parentNode.insertBefore(errorEl, input.nextSibling);
    } else {
      step.appendChild(errorEl);
    }
  }
  errorEl.textContent = message;
}

function clearError(stepIndex) {
  const step = steps[stepIndex];
  const errorEl = step.querySelector(".error-message");
  if (errorEl) errorEl.textContent = "";
}

function updateSteps() {
  const visibleSteps = getVisibleSteps();
  if (currentStep >= visibleSteps.length) {
    currentStep = visibleSteps.length - 1;
  }

  steps.forEach(step => step.classList.remove("active"));
  visibleSteps[currentStep]?.classList.add("active");

  prevBtn.style.display = currentStep === 0 ? "none" : "inline-block";
  nextBtn.textContent = currentStep === visibleSteps.length - 1 ? "Завершити" : "Далі";

  const absoluteIndex = Array.from(steps).indexOf(visibleSteps[currentStep]);
  const progress = ((absoluteIndex + 1) / TOTAL_STEPS) * 100;
  progressFill.style.width = `${progress}%`;

  clearError(absoluteIndex);
  updateWeightActionWord();
  updateCaloriesText();
  const info = visibleSteps[currentStep]?.querySelector("#targetWeightInfo");
  if (info) info.style.display = "block";
}

function updateWeightActionWord() {
  const goal = goalSelect.value;
  weightActionSpan.textContent =
    goal === "схуднення" ? "позбутись" : goal === "набір ваги" ? "набрати" : "змінити";
}

function updateCaloriesText() {
  const goal = goalSelect.value;
  if (goal === "набір ваги") {
    caloriesTitle.textContent = "Скільки калорій хочете отримувати на день?";
    caloriesDesc.textContent = "Це допоможе нам сформувати план набору.";
  } else {
    caloriesTitle.textContent = "Скільки калорій хочете спалювати на день?";
    caloriesDesc.textContent = "Це допоможе нам сформувати план схуднення.";
  }
}

goalSelect.addEventListener("change", () => {
  updateWeightActionWord();
  updateCaloriesText();
  updateSteps();
});

prevBtn.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep--;
    updateSteps();
  }
});

document.getElementById("password").addEventListener("input", () => {
  const value = document.getElementById("password").value;
  const strengthBar = document.getElementById("password-strength");
  passwordStrengthScore = 0;
  if (value.length >= 8) passwordStrengthScore++;
  if (/[A-Z]/.test(value)) passwordStrengthScore++;
  if (/[a-z]/.test(value)) passwordStrengthScore++;
  if (/[0-9]/.test(value)) passwordStrengthScore++;
  if (/[^A-Za-z0-9]/.test(value)) passwordStrengthScore++;

  strengthBar.style.width = passwordStrengthScore <= 2 ? "30%" : passwordStrengthScore <= 4 ? "60%" : "100%";
  strengthBar.style.backgroundColor = passwordStrengthScore <= 2 ? "red" : passwordStrengthScore <= 4 ? "orange" : "green";
});

nextBtn.addEventListener("click", async () => {
  const visibleSteps = getVisibleSteps();
  const currentEl = visibleSteps[currentStep];
  const currentInput = currentEl.querySelector("input, select");

  if (currentInput && !currentInput.checkValidity()) {
    currentInput.reportValidity();
    return;
  }

  const stepIndex = Array.from(steps).indexOf(currentEl);
  clearError(stepIndex);

  if (currentEl.id === "birthdate-step") {
    const birthDateValue = document.getElementById("birthdate").value;
    try {
      //const res = await fetch("https://worldtimeapi.org/api/ip");
      //const data = await res.json();
      const now = new Date();
      const birthDate = new Date(birthDateValue);
      if (birthDate >= now) {
        showError(stepIndex, "Дата народження не може бути в майбутньому.");
        return;
      }
      let age = now.getUTCFullYear() - birthDate.getUTCFullYear();
      const m = now.getUTCMonth() - birthDate.getUTCMonth();
      if (m < 0 || (m === 0 && now.getUTCDate() < birthDate.getUTCDate())) age--;
      if (age < 13 || age > 110) {
        showError(stepIndex, "Реєстрація доступна лише для користувачів віком 13–110 років.");
        return;
      }
    } catch {
      showError(stepIndex, "Помилка перевірки дати. Перевірте з’єднання.");
      return;
    }
  }

  if (currentEl.querySelector("#weight")) {
    const weight = parseInt(document.getElementById("weight").value);
    if (weight < 30 || weight > 300) {
      showError(stepIndex, "Вага має бути від 30 до 300 кг.");
      return;
    }
  }

  if (currentEl.querySelector("#height")) {
    const height = parseInt(document.getElementById("height").value);
    if (height < 100 || height > 250) {
      showError(stepIndex, "Зріст має бути від 100 до 250 см.");
      return;
    }
  }

  if (currentEl.querySelector("#gender")) {
    gender = document.getElementById("gender").value;
    if (!gender) {
      showError(stepIndex, "Оберіть стать.");
      return;
    }
  }

  if (currentEl.querySelector("#mealsPerDay")) {
    const meals = parseInt(document.getElementById("mealsPerDay").value);
    if (meals < 1 || meals > 7) {
      showError(stepIndex, "Прийомів їжі має бути від 1 до 7.");
      return;
    }
  }

  if (currentEl.querySelector("#targetWeightChange")) {
    const weight = parseInt(document.getElementById("weight").value);
    const height = parseInt(document.getElementById("height").value);
    const target = parseInt(document.getElementById("targetWeightChange").value);
    const goal = goalSelect.value;
    const minBMI = 18.5;
    const maxBMI = 24.9;
    let minWeight = Math.floor(minBMI * ((height / 100) ** 2));
    let maxWeight = Math.floor(maxBMI * ((height / 100) ** 2));
    if (gender === "ж") {
      minWeight -= 3;
      maxWeight -= 3;
    }
    const projectedWeight = goal === "схуднення" ? weight - target : weight + target;
    const step = steps[stepIndex];
    const existingConsent = step.querySelector(".consent-wrapper");

    if (
      (goal === "схуднення" && weight <= maxWeight) ||
      (goal === "набір ваги" && weight >= minWeight)
    ) {
      showError(stepIndex, goal === "схуднення"
        ? "Ваша вага вже в межах норми. Подальше схуднення можливе, але за згоди з фахівцем."
        : "Ви вже в межах норми. Подальший набір можливий, але не рекомендований.");

      if (!existingConsent) {
        const wrapper = document.createElement("div");
        wrapper.className = "consent-wrapper";
        wrapper.style.marginTop = "10px";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = "consentCheckbox";
        checkbox.style.marginRight = "6px";

        const label = document.createElement("label");
        label.htmlFor = "consentCheckbox";
        label.textContent = `Я розумію наслідки та хочу продовжити ${goal === "схуднення" ? "схуднення" : "набір"}.`;

        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
        step.appendChild(wrapper);
      }

      const consentBox = step.querySelector("#consentCheckbox");
      if (!consentBox.checked) {
        showError(stepIndex, "Потрібно підтвердити намір, щоб продовжити.");
        return;
      }
    }

    if (goal === "схуднення" && projectedWeight < minWeight) {
      showError(stepIndex, `Зменшення нижче ${minWeight} кг не рекомендоване.`);
      return;
    }

    if (goal === "набір ваги" && projectedWeight > maxWeight) {
      showError(stepIndex, `Набір понад ${maxWeight} кг виходить за межі норми.`);
      return;
    }
  }

  if (currentEl.querySelector("#caloriesPerDay")) {
    const calories = parseInt(document.getElementById("caloriesPerDay").value);
    const goal = goalSelect.value;
    if (goal === "схуднення" && (isNaN(calories) || calories < 100 || calories > 1200)) {
      showError(stepIndex, "Введіть значення від 100 до 1200 ккал.");
      return;
    }
    if (goal === "набір ваги" && (isNaN(calories) || calories < 100 || calories > 10000)) {
      showError(stepIndex, "Введіть значення від 100 до 10 000 ккал.");
      return;
    }
  }

  if (currentEl.querySelector("#password")) {
    if (passwordStrengthScore <= 2) {
      showError(stepIndex, "Пароль занадто слабкий.");
      return;
    }
  }

  if (currentStep < visibleSteps.length - 1) {
    currentStep++;
    updateSteps();
  } else {
    const nickname = document.getElementById("nickname").value.trim();
    const birthDateValue = document.getElementById("birthdate").value;
    const weight = parseInt(document.getElementById("weight").value);
    const height = parseInt(document.getElementById("height").value);
    const gender = document.getElementById("gender").value;
    const mealsPerDay = parseInt(document.getElementById("mealsPerDay").value);
    const lifestyle = document.getElementById("lifestyle").value;
    const goal = goalSelect.value;
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const targetWeightChange = document.getElementById("targetWeightChange")?.value || null;
    const caloriesPerDay = document.getElementById("caloriesPerDay")?.value || null;
    if (password !== confirmPassword) {
      showError(stepIndex, "Паролі не співпадають.");
      return;
    }

    const userData = {
      nickname,
      birthDate: new Date(birthDateValue).toISOString(),
      email,
      password,
      weight,
      height,
      gender,
      mealsPerDay,
      lifestyle,
      goal,
      targetWeightChange: isWeightChangeGoal() ? Number(targetWeightChange) : null,
      caloriesPerDay: isWeightChangeGoal() ? Number(caloriesPerDay) : null,
    };

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
  
      const data = await response.json();
      if (response.ok) {
        const { token } = data;
  
        localStorage.setItem("token", token);
        localStorage.setItem("userName", userData.nickname);
        localStorage.setItem("userEmail", userData.email);
        localStorage.setItem("userGender", userData.gender);

  
        const planResponse = await fetch("http://localhost:5000/api/plan", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        if (!planResponse.ok) {
        }
  
        location.href = "loading.html";
      } else {
        showError(stepIndex, data.message || "Помилка");
      }
    } catch {
      showError(stepIndex, "Помилка з’єднання з сервером");
    }
  }
  });
  
  updateSteps();
  
