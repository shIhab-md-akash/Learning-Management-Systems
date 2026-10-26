# LearnHub — Learning Management System

A full-stack LMS with three roles (admin, instructor, student).

**Stack:** Django 5 + Django REST Framework + SimpleJWT + SQLite (backend) · React 19 + Vite + React Router + Axios (frontend)

## Features
- JWT auth: register, login, refresh, logout, forgot/reset password, profile
- Role-based access control (admin / instructor / student)
- Course catalog with search, category and level filters
- Student enrollment with progress tracking
- Instructor course CRUD and enrolled-student roster
- Role-specific dashboards with reports; admin user/role management
- `seed_lms_data` command and audit middleware

## Setup
Requires Python 3.11+ and Node 20+.

**Backend** (http://localhost:8000)
```
cd backend
python -m venv venv
venv\Scripts\activate          # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_lms_data
python manage.py runserver
```

**Frontend** (http://localhost:5173)
```
cd frontend
npm install
npm run dev
```

Run tests: `python manage.py test` (in `backend/`).

## Demo accounts
| Role | Username | Password |
|---|---|---|
| Admin | admin | admin123 |
| Instructor | instructor_jane / instructor_mark | pass123 |
| Student | student_alex / student_sara | pass123 |

## Screenshots
See `docs/screenshots/`.
# Learning-Management-Systems
