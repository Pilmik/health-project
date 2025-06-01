# Опис проєкту

Health Plus - простий інтерактивний застосунок, як інструмент для відстеження показників здоров’я і параметрів тіла, подолання дефіциту чи профіциту ваги. Користувач зможе моніторити свій прогрес та коригувати значення показників. Застосунок зосереджений на базовому функціоналі без перевантаження інтерфейсу,орієнтований на щоденну взаємодію без вбудованої реклами, забезпечує підтримку країнської мови та містить у базі даних продукти виготовлені в Україні, має доступ до всіх можливостей без платних обмежень.

---

## Підготовка середовища

* Встановити Node.js (LTS): https://nodejs.org/en 
* Реєстрація на MongoDB: https://www.mongodb.com/products/platform/atlas-database

---

## Клонування репозиторію

```bash
git clone https://github.com/Pilmik/health-project.git
cd health-project
```

---

## Структура проєкту

health-project/
├── client/         # Папка для frontend (HTML, CSS, JS)
├── server/         # Папка для backend (Node.js + Express)
├── .gitignore
├── .env            # Шаблон конфігурації середовища
└── README.md       # Інструкція з налаштування

---

## Залежності

```bash
cd server
npm intall
```

---

## .env

Підготуйте папку для налаштувань змінних середовища:
```bash
touch .env
```

Приклад вмісту:
```.env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key # ваш пароль
```

---

## Налаштування MongoDB
1. Перейти на сайт: https://www.mongodb.com/cloud/atlas
2. Зареєструватися або увійти через Google
3. Натиснути "Create" → "New Project"
4. Назвати проєкт (наприклад, health-project) і натиснути "Next"
5. Натиснути "Create Cluster" (вибрати безкоштовний Tier 0 → AWS або Azure)
6. Дочекатись створення кластеру (може зайняти 1–2 хвилини)
7. Перейти до вкладки Database Access → натиснути "Add New Database User":
   - задати Username і Password
   - виставити роль: Read and write to any database
8. Перейти до Network Access → Add IP Address
   - обрати Allow access from anywhere або додати свою IP
9. У вкладці Clusters → натиснути "Connect"
   - обрати Connect your application
   - скопіювати рядок з mongodb+srv://... і вставити у .env як значення MONGO_URL

---

## Команда

- Молчанов Олексій
- Пілат Михайло
- Пілат Єва

НАУКМА 2025