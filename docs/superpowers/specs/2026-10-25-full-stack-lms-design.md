# Full Stack Learning Management System (LMS) Design Specification

**Date:** 2026-10-25  
**Status:** Approved  
**Project:** Full Stack LMS using Django (Backend) & React (Frontend)  
**Authors:** Shihab & Antigravity  

---

## 1. Executive Summary & Project Objective

The goal of this project is to build a robust, secure, and role-based Learning Management System (LMS) with a decoupled full-stack architecture.

The project evaluates mastery of:
*   Secure authentication & authorization using JSON Web Tokens (JWT)
*   Role-Based Access Control (RBAC) dividing permissions across **Admin**, **Instructor**, and **Student**
*   Clean REST API design with Django REST Framework (DRF)
*   Token-based password reset workflow with email notification
*   Frontend-backend integration with React (Vite), Axios interceptors, and protected routes
*   Interactive role-tailored dashboards and statistical reporting
*   Automated seeding, clear documentation, and submission artifacts

---

## 2. System Architecture & Project Layout

The repository is structured as a decoupled monorepo containing a `backend/` directory for Django and a `frontend/` directory for React.

```
d:/Learning Management System/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── lms_backend/               # Root Django project
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── users/                     # App 1: Auth, Roles, Profiles, Reset
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   ├── middleware.py
│   │   └── signals.py
│   └── lms_core/                  # App 2: Courses, Enrollments, Reports
│       ├── migrations/
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       ├── urls.py
│       ├── reports.py
│       └── management/
│           └── commands/
│               └── seed_lms_data.py
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── assets/
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── services/
│       │   ├── api.js
│       │   ├── authService.js
│       │   ├── lmsService.js
│       │   └── reportService.js
│       ├── components/
│       │   ├── common/
│       │   │   ├── Navbar.jsx
│       │   │   ├── Sidebar.jsx
│       │   │   ├── ProtectedRoute.jsx
│       │   │   ├── StatCard.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── Alert.jsx
│       │   │   └── LoadingSpinner.jsx
│       │   └── lms/
│       │       ├── CourseCard.jsx
│       │       ├── CourseFormModal.jsx
│       │       └── ProgressBar.jsx
│       ├── pages/
│       │   ├── auth/
│       │   │   ├── LoginPage.jsx
│       │   │   ├── RegisterPage.jsx
│       │   │   ├── ForgotPasswordPage.jsx
│       │   │   └── ResetPasswordPage.jsx
│       │   ├── profile/
│       │   │   └── ProfilePage.jsx
│       │   ├── courses/
│       │   │   ├── CourseListPage.jsx
│       │   │   ├── CourseDetailPage.jsx
│       │   │   └── MyEnrollmentsPage.jsx
│       │   ├── instructor/
│       │   │   └── InstructorCoursesPage.jsx
│       │   └── dashboard/
│       │       ├── AdminDashboard.jsx
│       │       ├── InstructorDashboard.jsx
│       │       └── StudentDashboard.jsx
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-10-25-full-stack-lms-design.md
└── README.md
```

---

## 3. Database Schema & Data Models

### 3.1 App: `users`

#### Model: `User` (Inherits from `AbstractUser`)
*   `email`: `EmailField(unique=True)` (Required, primary contact & login alternative)
*   `role`: `CharField(max_length=20, choices=[('admin', 'Admin'), ('instructor', 'Instructor'), ('student', 'Student')], default='student')`
*   Standard Django fields: `username`, `first_name`, `last_name`, `is_active`, `is_staff`, `date_joined`, `password`

#### Model: `Profile`
*   `user`: `OneToOneField(User, on_delete=models.CASCADE, related_name='profile')`
*   `bio`: `TextField(blank=True)`
*   `avatar`: `ImageField(upload_to='avatars/', blank=True, null=True)` (with default avatar fallback)
*   `phone`: `CharField(max_length=20, blank=True)`
*   `headline`: `CharField(max_length=150, blank=True)` (e.g., "Full Stack Instructor & Architect")
*   `expertise`: `CharField(max_length=255, blank=True)` (e.g., "Python, Django, React, Cloud")
*   `education`: `CharField(max_length=255, blank=True)` (e.g., "B.Sc in Computer Science")
*   *Lifecycle:* Automatically created upon `User` creation via Django `post_save` signal.

#### Model: `PasswordResetToken`
*   `user`: `ForeignKey(User, on_delete=models.CASCADE, related_name='reset_tokens')`
*   `token`: `CharField(max_length=100, unique=True, db_index=True)`
*   `created_at`: `DateTimeField(auto_now_add=True)`
*   `expires_at`: `DateTimeField` (1-hour validity window)
*   `is_used`: `BooleanField(default=False)`

---

### 3.2 App: `lms_core`

#### Model: `Category`
*   `name`: `CharField(max_length=100, unique=True)`
*   `slug`: `SlugField(max_length=120, unique=True)`
*   `description`: `TextField(blank=True)`
*   `icon`: `CharField(max_length=50, default='BookOpen')`
*   `created_at`: `DateTimeField(auto_now_add=True)`

#### Model: `Course`
*   `title`: `CharField(max_length=255)`
*   `slug`: `SlugField(max_length=280, unique=True)`
*   `description`: `TextField`
*   `category`: `ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='courses')`
*   `instructor`: `ForeignKey(User, on_delete=models.CASCADE, related_name='courses', limit_choices_to={'role': 'instructor'})`
*   `thumbnail`: `ImageField(upload_to='courses/', blank=True, null=True)`
*   `price`: `DecimalField(max_digits=8, decimal_places=2, default=0.00)`
*   `level`: `CharField(max_length=20, choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')], default='beginner')`
*   `status`: `CharField(max_length=20, choices=[('draft', 'Draft'), ('published', 'Published'), ('archived', 'Archived')], default='published')`
*   `created_at`: `DateTimeField(auto_now_add=True)`
*   `updated_at`: `DateTimeField(auto_now=True)`

#### Model: `Enrollment`
*   `student`: `ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments', limit_choices_to={'role': 'student'})`
*   `course`: `ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')`
*   `enrolled_at`: `DateTimeField(auto_now_add=True)`
*   `status`: `CharField(max_length=20, choices=[('active', 'Active'), ('completed', 'Completed'), ('dropped', 'Dropped')], default='active')`
*   `progress`: `PositiveIntegerField(default=0)` (0 to 100%)
*   **Constraints:** `unique_together = ('student', 'course')`

---

## 4. Authentication, JWT & Password Management

### 4.1 Token Specifications
*   **Token Library:** `djangorestframework-simplejwt`
*   **Token Lifespans:**
    *   Access Token: 60 minutes
    *   Refresh Token: 7 days
*   **Custom Token Claims (`CustomTokenObtainPairSerializer`):**
    The JWT access token payload contains:
    *   `user_id`: Integer
    *   `username`: String
    *   `email`: String
    *   `role`: String (`admin` | `instructor` | `student`)

### 4.2 Password Reset Workflow
1.  **Request:** User submits email to `POST /api/auth/forgot-password/`.
2.  **Token Generation:** Backend generates a cryptographically secure 48-character URL-safe token with an expiration time 1 hour in the future, storing it in `PasswordResetToken`.
3.  **Notification:** Django renders an email template containing the link:  
    `http://localhost:5173/reset-password?token=<token>`  
    In development, `EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'` logs the reset link directly to the terminal console.
4.  **Reset:** User submits `{ token, new_password, confirm_password }` to `POST /api/auth/reset-password/`.
5.  **Validation:** Backend checks that the token exists, is not expired, and has `is_used == False`. It updates the user's password with PBKDF2 hashing, sets `is_used = True`, and invalidates old tokens.

---

## 5. Role-Based Access Control (RBAC) & DRF Permissions

### 5.1 Custom Permissions
*   `IsAdminRole`: Verifies `request.user.is_authenticated and (request.user.role == 'admin' or request.user.is_staff)`.
*   `IsInstructorRole`: Verifies `request.user.is_authenticated and request.user.role == 'instructor'`.
*   `IsStudentRole`: Verifies `request.user.is_authenticated and request.user.role == 'student'`.
*   `IsCourseOwnerOrAdmin`: For object-level operations on `Course`, checks `request.user.role == 'admin' or obj.instructor == request.user`.

### 5.2 Custom Middleware: `UserActivityLogMiddleware`
*   Logs each incoming request path, HTTP method, authenticated user ID, role, client IP address, and execution duration.
*   Enforces security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`).

---

## 6. REST API Specifications

### 6.1 Authentication & Users (`/api/auth/` and `/api/users/`)

| Method | Endpoint | Permission | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | AllowAny | Register new user (Student or Instructor) |
| `POST` | `/api/auth/login/` | AllowAny | Login with username/password, returns access, refresh, user data |
| `POST` | `/api/auth/token/refresh/`| AllowAny | Refresh access token |
| `POST` | `/api/auth/logout/` | IsAuthenticated | Invalidate refresh token |
| `POST` | `/api/auth/forgot-password/` | AllowAny | Generate reset token and email link |
| `POST` | `/api/auth/reset-password/` | AllowAny | Verify token and update password |
| `GET` | `/api/users/profile/` | IsAuthenticated | Retrieve current user profile and role details |
| `PUT/PATCH` | `/api/users/profile/` | IsAuthenticated | Update profile details (bio, avatar, headline, etc.) |
| `GET` | `/api/users/` | IsAdminRole | List all users with filtering by role |
| `PATCH` | `/api/users/<id>/role/` | IsAdminRole | Update a user's role |

### 6.2 LMS Core (`/api/lms/`)

| Method | Endpoint | Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/lms/categories/` | AllowAny | List all course categories |
| `POST` | `/api/lms/categories/` | IsAdminRole | Create new course category |
| `GET` | `/api/lms/courses/` | AllowAny | List published courses (or instructor's own courses via `?my_courses=true`) |
| `POST` | `/api/lms/courses/` | IsInstructorRole \| IsAdminRole | Create a course (sets instructor to current user) |
| `GET` | `/api/lms/courses/<id>/`| AllowAny | Retrieve course details with instructor bio |
| `PUT/PATCH` | `/api/lms/courses/<id>/`| IsCourseOwnerOrAdmin | Update course |
| `DELETE` | `/api/lms/courses/<id>/`| IsCourseOwnerOrAdmin | Delete course |
| `POST` | `/api/lms/courses/<id>/enroll/` | IsStudentRole | Enroll in course |
| `GET` | `/api/lms/enrollments/my/` | IsStudentRole | List current student's enrolled courses and progress |
| `PATCH` | `/api/lms/enrollments/<id>/progress/` | IsStudentRole \| IsInstructorRole | Update progress percentage (0-100%) |
| `GET` | `/api/lms/courses/<id>/students/` | IsCourseOwnerOrAdmin | List enrolled students for a specific course |

### 6.3 Reports & Dashboards (`/api/reports/`)

| Method | Endpoint | Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/admin/` | IsAdminRole | Summary metrics: total users, role breakdown, total courses, enrollments, recent logs |
| `GET` | `/api/reports/instructor/` | IsInstructorRole \| IsAdminRole | Instructor metrics: courses created, students enrolled, completion rate |
| `GET` | `/api/reports/student/` | IsStudentRole | Student metrics: active enrollments, completed courses, average progress |

---

## 7. Frontend Architecture (React + Vite)

### 7.1 State Management & Context
*   **`AuthContext.jsx`**:
    *   State: `user`, `accessToken`, `refreshToken`, `loading`, `isAuthenticated`
    *   Methods: `login(credentials)`, `register(userData)`, `logout()`, `updateProfile(data)`
    *   Tokens persisted securely in `localStorage` under keys `lms_access_token` and `lms_refresh_token`.

### 7.2 API Client & Axios Interceptors (`api.js`)
*   **Request Interceptor:** Automatically injects `Authorization: Bearer <token>` if token exists.
*   **Response Interceptor:** Automatically intercepts `401 Unauthorized`. If token expired, requests a fresh access token from `/api/auth/token/refresh/`. If refresh succeeds, original request is seamlessly retried. If refresh fails, tokens are cleared and user is redirected to `/login`.

### 7.3 Route Definitions & Protected Route Guards

```jsx
// Route Configuration Hierarchy
/                     -> CourseListPage (Public / Catalog)
/courses/:id          -> CourseDetailPage (Public)
/login                -> LoginPage (Public / Guest)
/register             -> RegisterPage (Public / Guest)
/forgot-password      -> ForgotPasswordPage (Public / Guest)
/reset-password       -> ResetPasswordPage (Public / Guest)

// Protected (Any Authenticated User)
/profile              -> ProfilePage

// Protected (Student Only)
/dashboard            -> StudentDashboard
/my-courses           -> MyEnrollmentsPage

// Protected (Instructor Only)
/instructor/dashboard -> InstructorDashboard
/instructor/courses   -> InstructorCoursesPage

// Protected (Admin Only)
/admin/dashboard      -> AdminDashboard
/admin/users          -> AdminUserManagementPage
```

### 7.4 UI Design System & Component Library
*   **Styling:** Modern Vanilla CSS Design Tokens (HSL/Hex variables, Dark Slate `#0f172a` backdrop, Crisp Indigo `#6366f1` brand accent, Glassmorphism panels, CSS Grid/Flexbox layouts).
*   **Icons:** `lucide-react` for crisp vector iconography.
*   **Animations:** Smooth card hover transitions, loading skeletons, alert toasts, and dynamic SVG/CSS progress rings.

---

## 8. Data Seeding & Verification Strategy

### 8.1 Management Command: `python manage.py seed_lms_data`
Pre-populates deterministic test data for grading:
1.  **Users:**
    *   Admin: `username: admin`, `password: admin123`, `email: admin@lms.local`, `role: admin`
    *   Instructor: `username: instructor_jane`, `password: pass123`, `email: jane@lms.local`, `role: instructor`
    *   Student: `username: student_alex`, `password: pass123`, `email: alex@lms.local`, `role: student`
2.  **Categories:** Web Development, Data Science & AI, Cloud Computing, Cyber Security.
3.  **Courses:**
    *   *Modern Full Stack Web Development with Django & React*
    *   *Mastering Machine Learning & Neural Networks*
    *   *Cloud Architecture & Microservices on Kubernetes*
4.  **Enrollments:** Active and completed enrollments for `student_alex` with realistic progress percentages (e.g. 75% and 100%).

---

## 9. Submission Deliverables

1.  **Monorepo Codebase:** Clean `backend/` and `frontend/` folders without temporary clutter.
2.  **Root `README.md`:**
    *   Architecture summary and features
    *   Prerequisites and dependencies
    *   Step-by-step setup instructions for Django and React
    *   Pre-seeded demo credentials for all 3 roles
    *   REST API Endpoint Reference
3.  **Submission Screenshots:**
    *   `login_screen.png`: Login interface with validation feedback
    *   `admin_dashboard.png`: Admin metrics cards, role distribution, and user summary
    *   `instructor_dashboard.png`: Instructor course management with enrolled students list
    *   `course_catalog.png`: Public/Student course listing with search and category filters
