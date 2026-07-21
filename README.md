# 💰 BudgetBuddy – Personal Budget Planning and Expense Management Platform

BudgetBuddy is a full-stack web application that helps users manage their personal finances by tracking income and expenses, creating budgets, setting savings goals, and analyzing spending habits through interactive dashboards.

## 📌 Features

- 🔐 Secure User Authentication (JWT)
- 👤 User Profile Management
- 💵 Income Tracking
- 💸 Expense Tracking
- 📊 Monthly Budget Planning
- 🎯 Savings Goal Management
- 📈 Financial Analytics Dashboard
- 🔔 Budget & Savings Notifications
- 📄 Monthly Reports
- 📤 Export Reports (PDF/Excel)

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- Axios
- Tailwind CSS
- Chart.js / Recharts

### Backend
- Python
- Django
- Django REST Framework (DRF)

### Database
- SQLite (Development)
- PostgreSQL (Production)

### Authentication
- JWT (SimpleJWT)

### Tools
- Git & GitHub
- VS Code
- Postman

## 📂 Project Structure

```
BudgetBuddy/
├── backend/
│   ├── accounts/
│   ├── budgets/
│   ├── expenses/
│   ├── incomes/
│   ├── savings/
│   └── manage.py
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## 🚀 Installation

### Backend

```bash
git clone https://github.com/your-username/BudgetBuddy.git

cd BudgetBuddy/backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

### Frontend

```bash
cd frontend

npm install

npm start
```

## 📷 Main Modules

- User Authentication
- Profile Management
- Income Management
- Expense Management
- Budget Planning
- Savings Goals
- Reports
- Analytics Dashboard
- Notifications

## 📊 Future Enhancements

- Google OAuth Login
- Email Notifications
- AI-based Expense Prediction
- Mobile Application
- Cloud Deployment

## 👨‍💻 Author

**Yeshwanth V K**

Final Year B.Tech – Information Technology

RMK Engineering College

## 📄 License

This project is developed for learning and educational purposes.