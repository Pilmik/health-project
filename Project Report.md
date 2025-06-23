# Звіт про виконання проєкту "Health Plus"

## 1. Постановка і аналіз задачі

**Мета проєкту**: Розробка простого інтерактивного застосунку "Health Plus" для відстеження показників здоров’я та параметрів тіла, спрямованого на подолання дефіциту чи профіциту ваги. Застосунок орієнтований на щоденну взаємодію, підтримує українську мову, включає базу продуктів українського виробництва та забезпечує доступ до всіх функцій без платних обмежень. Особлива увага приділена адаптації для різних вікових груп, зокрема старшого покоління, яке може мати труднощі з опануванням програмного забезпечення через пострадянське виховання та можливі розлади харчової поведінки.

**Аналіз задачі**:
- **Цільова аудиторія**: Молоде покоління та старші користувачі, які потребують простого інтерфейсу з великими кнопками, чіткими шрифтами та покроковими підказками.
- **Основні вимоги**:
  - Реєстрація та авторизація з підтримкою надійного пароля.
  - Інтерактивний дашборд для відстеження прогресу (калорії, вода, кроки, вага).
  - Автоматичне генерування персоналізованого плану на основі даних користувача (BMR, TDEE, макронутрієнти).
  - Локальна база продуктів із підтримкою українських страв.
  - Можливість редагування даних за минулі дні.
  - Візуалізація прогресу у вигляді графіків (за тиждень/місяць).
  - Відсутність реклами та платних обмежень.
- **Технічні вимоги**:
  - Використання HTML, CSS, JavaScript для фронтенду.
  - Node.js, Express.js, MongoDB для бекенду та бази даних.
  - Інструменти для комунікації та управління проєктом: Trello, Slack, MSTeams, GitHub.

**План реалізації** (на основі документа):
- **24–30.05**: Постановка задачі, створення прототипу інтерфейсу.
- **01–11.06**: Тестування прототипу, розробка інструкції та презентації.
- **11–15.06**: Налагодження користувацького досвіду.
- **22.06**: Фінальна версія проєкту.

## 2. Короткий опис системи

**Система**: "Health Plus" — це вебзастосунок, реалізований за допомогою технологічного стеку:
- **Frontend**: HTML, CSS, JavaScript для створення інтерактивного інтерфейсу з підтримкою української мови. Інтерфейс включає багатокрокову форму реєстрації, дашборд із візуалізацією прогресу (кругові та лінійні діаграми), календар для вибору дати та модуль додавання продуктів.
- **Backend**: Node.js з фреймворком Express.js для обробки запитів, авторизації (JWT), та інтеграції з базою даних MongoDB.
- **Database**: MongoDB Atlas для зберігання даних користувачів, персоналізованих планів, щоденних записів (їжа, вода, кроки, вага) та бази продуктів.
- **Інструменти управління**: Trello для відстеження завдань, Slack і MSTeams для комунікації, GitHub для контролю версій.

**Особливості системи**:
- Динамічне оновлення сторінок без перезавантаження.
- Локальна база продуктів із харчовою цінністю.
- Автоматичний розрахунок калорій, макронутрієнтів, води та кроків.
- Інтерактивна аналітика з графіками для оцінки прогресу.

## 3. Визначення класів

На основі вимог та структури проєкту визначено такі основні класи (моделі) для бекенду:

1. **User**:
   - Атрибути: ім’я, email, пароль (захешований), дата народження, вага, зріст, стать, спосіб життя, ціль (схуднення/набір ваги), бажана зміна ваги, щоденні цілі (калорії, вода, кроки).
   - Функціонал: Реєстрація, авторизація, зберігання персональних даних.

2. **Plan**:
   - Атрибути: BMR, TDEE, добові норми калорій, макронутрієнтів, води, кроків, прогнозована дата досягнення цілі.
   - Функціонал: Генерація персоналізованого плану на основі даних користувача.

3. **DailyProgress**:
   - Атрибути: дата, спожита їжа, кількість води, кроки, вага, оцінка якості раціону (healthScore).
   - Функціонал: Зберігання та редагування щоденних даних користувача.

4. **Product**:
   - Атрибути: назва, калорійність, макронутрієнти (білки, жири, вуглеводи).
   - Функціонал: Пошук продуктів, додавання до раціону, оновлення калорійності та макронутрієнтів.

## 4. Вихідні тексти програми з коментарями

Нижче наведено приклади основних файлів із коментарями. Для повноти представлені ключові частини коду.

### app.js (Backend)
```javascript
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
```
### Фрагмент коду для демонстрації валідації фізичних параметрів client/register.js 
```javascript
if (currentEl.querySelector("#weight")) {
    const weight = parseInt(document.getElementById("weight").value);
    if (weight < 30  weight > 300) {
      showError(stepIndex, "Вага має бути від 30 до 300 кг.");
      return;
    }
  }

  if (currentEl.querySelector("#height")) {
    const height = parseInt(document.getElementById("height").value);
    if (height < 100  height > 250) {
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
```

### Фрагмент client/dashboard.html (Frontend)
```html
<div class="section-meals">

  <div class="meal-block">
    <img src="Icons/egg.svg" alt="Сніданок" class="meal-icon" />
    <div class="meal-info">
      <div class="meal-title">Сніданок</div>
      <div class="meal-kcal">0 / 500 ккал</div>
    </div>
    <button class="meal-add">+</button>
  </div>

  <div class="meal-block">
    <img src="Icons/burito.svg" alt="Обід" class="meal-icon" />
    <div class="meal-info">
      <div class="meal-title">Обід</div>
      <div class="meal-kcal">0 / 700 ккал</div>
    </div>
    <button class="meal-add">+</button>
  </div>

  <div class="meal-block">
    <img src="Icons/salad.svg" alt="Вечеря" class="meal-icon" />
    <div class="meal-info">
      <div class="meal-title">Вечеря</div>
      <div class="meal-kcal">0 / 600 ккал</div>
    </div>
    <button class="meal-add">+</button>
  </div>

  <div class="meal-block">
    <img src="Icons/applle.svg" alt="Перекуси" class="meal-icon" />
    <div class="meal-info">
      <div class="meal-title">Перекуси</div>
      <div class="meal-kcal">0 / 300 ккал</div>
    </div>
    <button class="meal-add">+</button>
  </div>
</div>
```

## 5. Реліз контрольного проєкту

**Статус проєкту**: Проєкт "Health Plus" успішно завершено відповідно до технічного завдання. Фінальна версія була представлена 23.06.2025.

**Досягнення**:
- Реалізовано всі ключові функції: реєстрація, авторизація, персоналізований план, дашборд, додавання продуктів, редагування даних за минулі дні, статистика з графіками.
- Забезпечено підтримку української мови та локальної бази продуктів.
- Інтерфейс адаптовано для різних вікових груп із великими кнопками, чіткими шрифтами та покроковими підказками.
- Використано сучасний стек технологій (HTML, CSS, JavaScript, Node.js, Express.js, MongoDB).
- Проєкт протестовано та налагоджено для стабільної роботи.

**Репозиторій**: Код доступний за посиланням: [https://github.com/Pilmik/health-project](https://github.com/Pilmik/health-project).

**Команда**:
- Молчанов Олексій – Frontend.
- Пілат Михайло – Backend, Database.
- Пілат Єва – UI/UX, Project Management.

**Висновок**: Проєкт відповідає поставленим вимогам, забезпечує зручний і доступний інструмент для відстеження здоров’я, адаптований до потреб української аудиторії.