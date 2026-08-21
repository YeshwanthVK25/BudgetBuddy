# 💰 BudgetBuddy

**Student Finance, Simplified.**
Track pocket money, plan budgets, and hit your savings goals — one clean dashboard for your whole financial life on campus.

---

## 📖 Overview

BudgetBuddy is a full-stack personal finance management app built with a **Django REST Framework** backend and a **React** frontend. It helps users track income and expenses, set budgets with automatic alerts, work toward savings goals, and view financial analytics — all secured with JWT authentication.

---

## ✨ Features

- **Authentication** — JWT-based registration, login, and token refresh
- **Expense Tracking** — Create, edit, delete, filter, and sort expenses by category and date
- **Income Management** — Log and manage income sources
- **Budgets** — Set monthly budgets per category with automatic utilization tracking
- **Budget Alerts** — Automatic notifications at 80%, 90%, and 100%+ budget utilization
- **Savings Goals** — Track progress toward savings targets with completion notifications
- **Notifications** — In-app notification center for all account activity
- **Analytics Dashboard** — Financial summary, category breakdown, monthly trends, income vs. expense comparison, and budget/goal progress visualizations
- **Reports** — Generate date-range reports and export as **CSV** or **PDF**
- **Email Notifications** — Key alerts delivered to your inbox via Gmail SMTP

---

## 🛠️ Tech Stack

**Backend**
- Django & Django REST Framework
- Simple JWT (authentication)
- SQLite (development database)

**Frontend**
- React
- Axios (API requests with automatic token refresh)
- Recharts (charts and visualizations)
- jsPDF & jsPDF-AutoTable (PDF report generation)

---

## 📂 Project Structure

```
BudgetBuddy/
├── backend/
│   ├── config/          # Project settings and URLs
│   ├── users/            # Registration, login, profile
│   ├── expenses/          # Expense CRUD + budget trigger
│   ├── income/            # Income CRUD
│   ├── budgets/            # Budget CRUD + alert logic
│   ├── goals/               # Savings goals CRUD
│   ├── notifications/        # Notification system
│   └── analytics/              # Dashboard, reports, and analytics endpoints
└── frontend/
    └── src/
        ├── pages/         # Login, Register, Dashboard, Reports, Goals, Notifications
        ├── components/     # Sidebar, Spinner, shared UI
        ├── context/          # AuthContext
        └── api/                # Axios instance with JWT interceptors
```

---

## 🚀 Getting Started

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The React app runs on `http://localhost:3000` and the Django API on `http://127.0.0.1:8000/api`.

---

## 🔑 Environment Variables

Create a `.env` file in `backend/` (not committed to version control) with:

```
SECRET_KEY=your-django-secret-key
EMAIL_HOST_USER=your-gmail-address@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
```

---

## 🔐 API Authentication

All protected endpoints require a JWT Bearer token:

```
POST /api/token/           → obtain access & refresh tokens
POST /api/token/refresh/   → refresh an expired access token
POST /api/register/        → create a new account
```

Include the access token in requests:
```
Authorization: Bearer <access_token>
```

---

## 📊 Key API Endpoints

| Endpoint | Description |
|---|---|
| `/api/expenses/` | List/create expenses |
| `/api/income/` | List/create income |
| `/api/budgets/alerts/` | Budget utilization & alerts |
| `/api/goals/` | Savings goals |
| `/api/notifications/` | Notification list |
| `/api/analytics/dashboard/` | Combined dashboard data |
| `/api/analytics/report/` | Date-range report (CSV/PDF export via frontend) |

---

## 🧪 Testing

The app has been manually tested end-to-end, covering:
- Registration, login, and JWT persistence
- Expense/income CRUD with validation
- Budget creation and automatic alert thresholds
- Savings goal progress and completion notifications
- Full dashboard and report generation
- Error handling for invalid input and unavailable API

---

## 📌 Status

Actively developed as part of a milestone-based learning project — analytics, testing, and deployment features in progress.

---

## 👤 Author

Built by Yeshwanth V.K.
