# Full Stack Learning Management System (LMS) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a secure, production-grade, role-based Learning Management System (LMS) featuring Django/DRF backend with JWT authentication and React (Vite) frontend with interactive dashboards.

**Architecture:** A decoupled monorepo with `backend/` running Django 5 + Django REST Framework with SQLite, SimpleJWT, and custom RBAC permissions; and `frontend/` running React 18 + Vite with role-guarded routes, Axios interceptors, and a custom CSS design system.

**Tech Stack:** Python 3.11+, Django 5+, Django REST Framework, djangorestframework-simplejwt, django-cors-headers, React 18, Vite, React Router v6, Axios, Lucide React.

**Spec:** [docs/superpowers/specs/2026-10-25-full-stack-lms-design.md](file:///d:/Learning%20Management%20System/docs/superpowers/specs/2026-10-25-full-stack-lms-design.md)

## Global Constraints

*   Monorepo structure: `backend/` for Django and `frontend/` for React.
*   User roles must strictly be: `'admin'`, `'instructor'`, `'student'`.
*   Password reset tokens must expire after 1 hour and cannot be reused (`is_used = True`).
*   Enrollments must enforce uniqueness: a student cannot enroll twice in the same course.
*   Frontend must use Axios interceptors for attaching `Bearer <token>` and handling token refresh on 401s.
*   Database defaults to SQLite for zero-config portable grading and evaluation.

## Review Focus

1.  **Duplicate Enrollment Prevention:** A student requesting enrollment in an already-enrolled course must receive a clean HTTP 400 with `{ "error": "Already enrolled in this course" }`, never an unhandled 500 IntegrityError.
2.  **Expired / Reused Reset Token:** Submitting an expired or previously consumed password reset token must return HTTP 400 with `{ "error": "Invalid or expired token" }`.
3.  **Role Authorization Guards:** Non-instructor students attempting to create or modify courses must receive HTTP 403 Forbidden.
4.  **Course Ownership Validation:** An instructor attempting to edit another instructor's course must be rejected with HTTP 403 Forbidden.
5.  **Token Refresh Loop Prevention:** Frontend Axios interceptor must prevent infinite loops if the refresh token itself is expired or invalid, cleanly clearing state and routing to `/login`.

---

### Task 1: Django Backend Scaffolding, Custom User Model & SQLite Setup

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/manage.py`
- Create: `backend/lms_backend/__init__.py`
- Create: `backend/lms_backend/settings.py`
- Create: `backend/lms_backend/urls.py`
- Create: `backend/users/__init__.py`
- Create: `backend/users/models.py`
- Create: `backend/users/signals.py`
- Create: `backend/users/apps.py`
- Test: `backend/users/tests/test_models.py`

**Interfaces:**
- Consumes: Python standard library, Django, DRF.
- Produces: `User` model with `role` field (`admin`, `instructor`, `student`), `Profile` model with auto-creation signal.

- [ ] **Step 1: Write the failing model test**
```python
# backend/users/tests/test_models.py
from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class UserModelTest(TestCase):
    def test_create_user_with_role(self):
        user = User.objects.create_user(
            username="teststudent",
            email="student@lms.local",
            password="password123",
            role="student"
        )
        self.assertEqual(user.role, "student")
        self.assertTrue(hasattr(user, "profile"))
        self.assertEqual(str(user), "teststudent (student)")
```

- [ ] **Step 2: Run test to verify it fails**
Run: `python backend/manage.py test users.tests.test_models`
Expected: FAIL (modules not found or User model not defined)

- [ ] **Step 3: Implement settings and models**
Create `backend/requirements.txt` with `django`, `djangorestframework`, `djangorestframework-simplejwt`, `django-cors-headers`, `pillow`.
Configure `lms_backend/settings.py` with `AUTH_USER_MODEL = 'users.User'`, installed apps, and SQLite.
Implement `users/models.py` with `User(AbstractUser)` having `role` choices and `Profile(OneToOneField(User))` with signal in `users/signals.py`.
Run migrations: `python backend/manage.py makemigrations users && python backend/manage.py migrate`

- [ ] **Step 4: Run test to verify it passes**
Run: `python backend/manage.py test users.tests.test_models`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add backend/
git commit -m "feat(backend): initialize Django project with custom User and Profile models"
```

---

### Task 2: JWT Authentication System (Registration, Login, Token Refresh & Logout)

**Files:**
- Create: `backend/users/serializers.py`
- Create: `backend/users/views.py`
- Create: `backend/users/urls.py`
- Modify: `backend/lms_backend/urls.py`
- Test: `backend/users/tests/test_auth_api.py`

**Interfaces:**
- Consumes: `User`, `Profile` from Task 1.
- Produces: Endpoints `POST /api/auth/register/`, `POST /api/auth/login/`, `POST /api/auth/token/refresh/`, `POST /api/auth/logout/`.

- [ ] **Step 1: Write the failing authentication API tests**
```python
# backend/users/tests/test_auth_api.py
from rest_framework.test import APITestCase
from django.urls import reverse

class AuthAPITest(APITestCase):
    def test_register_and_login_flow(self):
        reg_data = {
            "username": "instructor_bob",
            "email": "bob@lms.local",
            "password": "strongpassword123",
            "role": "instructor"
        }
        reg_res = self.client.post("/api/auth/register/", reg_data)
        self.assertEqual(reg_res.status_code, 201)

        login_data = {
            "username": "instructor_bob",
            "password": "strongpassword123"
        }
        login_res = self.client.post("/api/auth/login/", login_data)
        self.assertEqual(login_res.status_code, 200)
        self.assertIn("access", login_res.data)
        self.assertIn("refresh", login_res.data)
        self.assertEqual(login_res.data["user"]["role"], "instructor")
```

- [ ] **Step 2: Run test to verify it fails**
Run: `python backend/manage.py test users.tests.test_auth_api`
Expected: FAIL (404 not found)

- [ ] **Step 3: Implement serializers, views and URLs**
Implement `RegisterSerializer`, `CustomTokenObtainPairSerializer` (adding role, username, email to token claims & response payload), `RegisterView`, `LoginView`, `LogoutView`.
Wire up URLs in `backend/users/urls.py` under `/api/auth/` and register in root `lms_backend/urls.py`.

- [ ] **Step 4: Run test to verify it passes**
Run: `python backend/manage.py test users.tests.test_auth_api`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add backend/users/
git commit -m "feat(auth): add JWT registration, login, refresh, and logout endpoints"
```

---

### Task 3: Profile Management & Password Reset Flow

**Files:**
- Modify: `backend/users/models.py` (add `PasswordResetToken`)
- Modify: `backend/users/serializers.py` (add `ProfileSerializer`, `PasswordResetRequestSerializer`, `PasswordResetConfirmSerializer`)
- Modify: `backend/users/views.py` (add `ProfileView`, `PasswordResetRequestView`, `PasswordResetConfirmView`)
- Modify: `backend/users/urls.py`
- Test: `backend/users/tests/test_password_reset.py`

**Interfaces:**
- Consumes: `User`, `Profile`.
- Produces: `POST /api/auth/forgot-password/`, `POST /api/auth/reset-password/`, `GET /api/users/profile/`, `PUT /api/users/profile/`.

- [ ] **Step 1: Write the failing password reset and profile tests**
```python
# backend/users/tests/test_password_reset.py
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from users.models import PasswordResetToken

User = get_user_model()

class PasswordResetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="student_clara", email="clara@lms.local", password="oldpass123", role="student"
        )

    def test_forgot_and_reset_password_flow(self):
        # 1. Request reset
        req_res = self.client.post("/api/auth/forgot-password/", {"email": "clara@lms.local"})
        self.assertEqual(req_res.status_code, 200)
        token_obj = PasswordResetToken.objects.filter(user=self.user, is_used=False).first()
        self.assertIsNotNone(token_obj)

        # 2. Confirm reset
        confirm_res = self.client.post("/api/auth/reset-password/", {
            "token": token_obj.token,
            "new_password": "newsecurepass123",
            "confirm_password": "newsecurepass123"
        })
        self.assertEqual(confirm_res.status_code, 200)
        token_obj.refresh_from_db()
        self.assertTrue(token_obj.is_used)

        # 3. Verify login with new password
        login_res = self.client.post("/api/auth/login/", {
            "username": "student_clara", "password": "newsecurepass123"
        })
        self.assertEqual(login_res.status_code, 200)

    def test_reused_token_rejected(self):
        token_obj = PasswordResetToken.objects.create(
            user=self.user, token="used_token_xyz", expires_at="2099-01-01T00:00:00Z", is_used=True
        )
        res = self.client.post("/api/auth/reset-password/", {
            "token": "used_token_xyz", "new_password": "p", "confirm_password": "p"
        })
        self.assertEqual(res.status_code, 400)
```

- [ ] **Step 2: Run test to verify it fails**
Run: `python backend/manage.py test users.tests.test_password_reset`
Expected: FAIL

- [ ] **Step 3: Implement PasswordResetToken model, serializers, views and email generation**
Add `PasswordResetToken` to `users/models.py`.
Make and apply migrations.
Implement `ForgotPasswordView` (generating secure token with 1-hour expiry, sending console email) and `ResetPasswordConfirmView`.
Implement `UserProfileView` (supporting GET and PUT/PATCH).

- [ ] **Step 4: Run test to verify it passes**
Run: `python backend/manage.py test users.tests.test_password_reset`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add backend/users/
git commit -m "feat(users): implement profile management and token-based password reset"
```

---

### Task 4: LMS Core App — Categories, Courses & RBAC Permissions

**Files:**
- Create: `backend/lms_core/__init__.py`
- Create: `backend/lms_core/models.py` (Category, Course)
- Create: `backend/lms_core/permissions.py`
- Create: `backend/lms_core/serializers.py`
- Create: `backend/lms_core/views.py`
- Create: `backend/lms_core/urls.py`
- Modify: `backend/lms_backend/settings.py` (register `lms_core`)
- Modify: `backend/lms_backend/urls.py`
- Test: `backend/lms_core/tests/test_courses_api.py`

**Interfaces:**
- Consumes: `User` model, DRF permissions.
- Produces: `Category`, `Course` models, `/api/lms/categories/`, `/api/lms/courses/`, `IsAdminRole`, `IsInstructorRole`, `IsCourseOwnerOrAdmin`.

- [ ] **Step 1: Write the failing course and category API tests**
```python
# backend/lms_core/tests/test_courses_api.py
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class CourseAPITest(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser("admin_u", "admin@lms.local", "pass", role="admin")
        self.instructor = User.objects.create_user("inst_1", "inst1@lms.local", "pass", role="instructor")
        self.student = User.objects.create_user("stud_1", "stud1@lms.local", "pass", role="student")

    def test_student_cannot_create_course(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.post("/api/lms/courses/", {"title": "React Basics", "description": "Desc"})
        self.assertEqual(res.status_code, 403)

    def test_instructor_can_create_and_manage_own_course(self):
        self.client.force_authenticate(user=self.instructor)
        res = self.client.post("/api/lms/courses/", {
            "title": "Django REST Masterclass",
            "description": "Deep dive into APIs",
            "price": 49.99,
            "level": "intermediate"
        })
        self.assertEqual(res.status_code, 201)
        course_id = res.data["id"]
        self.assertEqual(res.data["instructor"]["username"], "inst_1")

        # Edit course
        edit_res = self.client.patch(f"/api/lms/courses/{course_id}/", {"title": "Django REST Advanced"})
        self.assertEqual(edit_res.status_code, 200)
```

- [ ] **Step 2: Run test to verify it fails**
Run: `python backend/manage.py test lms_core.tests.test_courses_api`
Expected: FAIL

- [ ] **Step 3: Implement Category, Course models, serializers, permissions, and views**
Create `lms_core/models.py` with `Category` and `Course`.
Create `lms_core/permissions.py` with `IsAdminRole`, `IsInstructorRole`, `IsStudentRole`, `IsCourseOwnerOrAdmin`.
Create `lms_core/serializers.py` with `CategorySerializer`, `CourseListSerializer`, `CourseDetailSerializer`.
Create `lms_core/views.py` with `CategoryViewSet` and `CourseViewSet`.
Run migrations: `python backend/manage.py makemigrations lms_core && python backend/manage.py migrate`.

- [ ] **Step 4: Run test to verify it passes**
Run: `python backend/manage.py test lms_core.tests.test_courses_api`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add backend/lms_core/
git commit -m "feat(lms): implement categories, courses and RBAC permission guards"
```

---

### Task 5: Student Enrollment System & Progress Tracking

**Files:**
- Modify: `backend/lms_core/models.py` (add `Enrollment`)
- Modify: `backend/lms_core/serializers.py` (add `EnrollmentSerializer`)
- Modify: `backend/lms_core/views.py` (add `EnrollView`, `MyEnrollmentsView`, `UpdateProgressView`, `CourseStudentsView`)
- Modify: `backend/lms_core/urls.py`
- Test: `backend/lms_core/tests/test_enrollments_api.py`

**Interfaces:**
- Consumes: `Course`, `User`.
- Produces: `POST /api/lms/courses/<id>/enroll/`, `GET /api/lms/enrollments/my/`, `PATCH /api/lms/enrollments/<id>/progress/`, `GET /api/lms/courses/<id>/students/`.

- [ ] **Step 1: Write the failing enrollment API tests**
```python
# backend/lms_core/tests/test_enrollments_api.py
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from lms_core.models import Course

User = get_user_model()

class EnrollmentAPITest(APITestCase):
    def setUp(self):
        self.instructor = User.objects.create_user("inst_jane", "jane@lms.local", "pass", role="instructor")
        self.student = User.objects.create_user("stud_dan", "dan@lms.local", "pass", role="student")
        self.course = Course.objects.create(
            title="FastAPI Fundamentals", description="API design", instructor=self.instructor, price=0
        )

    def test_student_enrollment_and_progress_flow(self):
        self.client.force_authenticate(user=self.student)
        # 1. Enroll
        enroll_res = self.client.post(f"/api/lms/courses/{self.course.id}/enroll/")
        self.assertEqual(enroll_res.status_code, 201)

        # 2. Duplicate enrollment returns 400
        dup_res = self.client.post(f"/api/lms/courses/{self.course.id}/enroll/")
        self.assertEqual(dup_res.status_code, 400)
        self.assertIn("error", dup_res.data)

        # 3. View my enrollments
        my_res = self.client.get("/api/lms/enrollments/my/")
        self.assertEqual(my_res.status_code, 200)
        self.assertEqual(len(my_res.data), 1)

        # 4. Update progress
        enroll_id = my_res.data[0]["id"]
        prog_res = self.client.patch(f"/api/lms/enrollments/{enroll_id}/progress/", {"progress": 100})
        self.assertEqual(prog_res.status_code, 200)
        self.assertEqual(prog_res.data["status"], "completed")
```

- [ ] **Step 2: Run test to verify it fails**
Run: `python backend/manage.py test lms_core.tests.test_enrollments_api`
Expected: FAIL

- [ ] **Step 3: Implement Enrollment model, serializer, and views**
Add `Enrollment` model with `unique_together = ('student', 'course')`.
Run migrations.
Implement `EnrollmentSerializer`, enrollment views with error handling for duplicates, progress updater, and course student roster for instructors.

- [ ] **Step 4: Run test to verify it passes**
Run: `python backend/manage.py test lms_core.tests.test_enrollments_api`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add backend/lms_core/
git commit -m "feat(lms): implement enrollment system and student progress tracking"
```

---

### Task 6: Reporting & Dashboard Summary APIs

**Files:**
- Create: `backend/lms_core/reports.py`
- Modify: `backend/lms_core/views.py`
- Modify: `backend/lms_core/urls.py`
- Test: `backend/lms_core/tests/test_reports_api.py`

**Interfaces:**
- Consumes: `User`, `Course`, `Enrollment`.
- Produces: `GET /api/reports/admin/`, `GET /api/reports/instructor/`, `GET /api/reports/student/`.

- [ ] **Step 1: Write the failing reports API tests**
```python
# backend/lms_core/tests/test_reports_api.py
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from lms_core.models import Course, Enrollment

User = get_user_model()

class ReportsAPITest(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser("admin_r", "admin@lms.local", "pass", role="admin")
        self.instructor = User.objects.create_user("inst_r", "inst@lms.local", "pass", role="instructor")
        self.student = User.objects.create_user("stud_r", "stud@lms.local", "pass", role="student")
        self.course = Course.objects.create(title="Testing", description="D", instructor=self.instructor)
        Enrollment.objects.create(student=self.student, course=self.course, progress=50)

    def test_admin_dashboard_report(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get("/api/reports/admin/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["total_users"], 3)
        self.assertEqual(res.data["role_counts"]["student"], 1)
        self.assertEqual(res.data["total_courses"], 1)
        self.assertEqual(res.data["total_enrollments"], 1)

    def test_instructor_report(self):
        self.client.force_authenticate(user=self.instructor)
        res = self.client.get("/api/reports/instructor/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["my_courses_count"], 1)
        self.assertEqual(res.data["total_students_enrolled"], 1)
```

- [ ] **Step 2: Run test to verify it fails**
Run: `python backend/manage.py test lms_core.tests.test_reports_api`
Expected: FAIL

- [ ] **Step 3: Implement aggregation queries in `reports.py` and report API views**
Implement `AdminReportView`, `InstructorReportView`, and `StudentReportView` computing aggregation statistics (total users, role breakdown, courses, enrollments, completion rates).
Wire URLs in `lms_core/urls.py`.

- [ ] **Step 4: Run test to verify it passes**
Run: `python backend/manage.py test lms_core.tests.test_reports_api`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add backend/lms_core/
git commit -m "feat(reports): implement dashboard summary APIs for admin, instructor and student"
```

---

### Task 7: Data Seeding Command (`seed_lms_data`) & Audit Middleware

**Files:**
- Create: `backend/users/middleware.py`
- Create: `backend/lms_core/management/__init__.py`
- Create: `backend/lms_core/management/commands/__init__.py`
- Create: `backend/lms_core/management/commands/seed_lms_data.py`
- Modify: `backend/lms_backend/settings.py` (add middleware and CORS settings)
- Test: `backend/users/tests/test_middleware.py`

**Interfaces:**
- Consumes: Django management framework, ORM models.
- Produces: CLI command `python manage.py seed_lms_data`, `UserActivityLogMiddleware`.

- [ ] **Step 1: Write the failing middleware test**
```python
# backend/users/tests/test_middleware.py
from django.test import TestCase, RequestFactory
from django.http import HttpResponse
from users.middleware import UserActivityLogMiddleware

class MiddlewareTest(TestCase):
    def test_middleware_executes_and_adds_headers(self):
        factory = RequestFactory()
        request = factory.get("/api/lms/courses/")
        middleware = UserActivityLogMiddleware(lambda r: HttpResponse("OK"))
        response = middleware(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["X-Content-Type-Options"], "nosniff")
```

- [ ] **Step 2: Run test to verify it fails**
Run: `python backend/manage.py test users.tests.test_middleware`
Expected: FAIL

- [ ] **Step 3: Implement `UserActivityLogMiddleware` and `seed_lms_data.py`**
Implement middleware logging requests and setting security headers.
Implement `seed_lms_data.py` creating:
- Admin (`admin` / `admin123`)
- Instructor (`instructor_jane` / `pass123`)
- Student (`student_alex` / `pass123`)
- 4 Categories with icons
- 3 Realistic courses with descriptions, levels, and pricing
- Sample active enrollments with progress
Configure CORS in `settings.py` allowing `http://localhost:5173` and `http://127.0.0.1:5173`.

- [ ] **Step 4: Run test and test seed command**
Run: `python backend/manage.py test users.tests.test_middleware`
Run: `python backend/manage.py seed_lms_data`
Expected: PASS with "Successfully seeded LMS database!"

- [ ] **Step 5: Commit**
```bash
git add backend/
git commit -m "feat(backend): add seed_lms_data command and activity log middleware"
```

---

### Task 8: React Frontend Scaffolding, Design Tokens & Auth Context with Axios Interceptors

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/index.css`
- Create: `frontend/src/services/api.js`
- Create: `frontend/src/services/authService.js`
- Create: `frontend/src/context/AuthContext.jsx`
- Create: `frontend/src/components/common/ProtectedRoute.jsx`
- Create: `frontend/src/components/common/Navbar.jsx`
- Create: `frontend/src/components/common/Alert.jsx`

**Interfaces:**
- Consumes: Backend `/api/auth/` and `/api/users/` endpoints.
- Produces: `AuthProvider`, `useAuth()` hook, Axios interceptor instance, `ProtectedRoute`, base design system.

- [ ] **Step 1: Initialize Vite React app and dependencies**
In `frontend/`, configure `package.json` with `react`, `react-dom`, `react-router-dom`, `axios`, `lucide-react`, `@vitejs/plugin-react`.
Run `npm install`.

- [ ] **Step 2: Implement design tokens and styles in `frontend/src/index.css`**
Set up modern CSS variables: dark palette (`--bg-primary: #0f172a`, `--bg-card: #1e293b`), indigo accents (`--primary: #6366f1`, `--primary-hover: #4f46e5`), typography, glassmorphism, responsive utilities, button and card classes.

- [ ] **Step 3: Implement Axios client with automatic JWT token refresh**
In `frontend/src/services/api.js`:
- Request interceptor: attaches `Bearer <access_token>` from `localStorage.getItem('lms_access_token')`.
- Response interceptor: catches 401s, attempts refresh via `/api/auth/token/refresh/`, replays original request on success, or triggers clean logout on refresh failure.

- [ ] **Step 4: Implement `AuthContext.jsx` and `ProtectedRoute.jsx`**
Provide `user`, `role`, `login`, `register`, `logout`, `loading`.
`ProtectedRoute` redirects unauthenticated users to `/login` and role-mismatched users to unauthorized screen.

- [ ] **Step 5: Verify build & commit**
Run: `npm run build` in `frontend/`
Expected: Successful build without errors.
```bash
git add frontend/
git commit -m "feat(frontend): scaffold React app with design tokens, AuthContext and Axios interceptors"
```

---

### Task 9: Authentication & Profile UI (Login, Register, Forgot Password, Reset Password, Profile)

**Files:**
- Create: `frontend/src/pages/auth/LoginPage.jsx`
- Create: `frontend/src/pages/auth/RegisterPage.jsx`
- Create: `frontend/src/pages/auth/ForgotPasswordPage.jsx`
- Create: `frontend/src/pages/auth/ResetPasswordPage.jsx`
- Create: `frontend/src/pages/profile/ProfilePage.jsx`
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- Consumes: `authService.js`, `AuthContext`.
- Produces: Full authentication and password recovery pages, Profile view & edit page.

- [ ] **Step 1: Implement `LoginPage.jsx` and `RegisterPage.jsx`**
Form validation, error banners, role selector on registration (Student vs Instructor), quick-login demo credential buttons for testing (`Admin`, `Instructor`, `Student`).

- [ ] **Step 2: Implement `ForgotPasswordPage.jsx` and `ResetPasswordPage.jsx`**
Forgot password request form displaying the generated reset token for convenient testing.
Reset password page extracting `?token=...` from URL query params, validating passwords match, and displaying success message.

- [ ] **Step 3: Implement `ProfilePage.jsx`**
Displays user identity, role badge, and allows editing bio, phone, headline, expertise, and education with feedback alerts.

- [ ] **Step 4: Verify routing and build**
Run: `npm run build` in `frontend/`
Expected: Clean build.

- [ ] **Step 5: Commit**
```bash
git add frontend/src/pages/
git commit -m "feat(frontend): build login, registration, password reset and profile management pages"
```

---

### Task 10: Course Catalog, Course Details & Enrollment UI

**Files:**
- Create: `frontend/src/services/lmsService.js`
- Create: `frontend/src/components/lms/CourseCard.jsx`
- Create: `frontend/src/components/lms/ProgressBar.jsx`
- Create: `frontend/src/pages/courses/CourseListPage.jsx`
- Create: `frontend/src/pages/courses/CourseDetailPage.jsx`
- Create: `frontend/src/pages/courses/MyEnrollmentsPage.jsx`
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- Consumes: `/api/lms/courses/`, `/api/lms/categories/`, `/api/lms/enrollments/`.
- Produces: Public course catalog with search and filters, Course detail view, Student enrollment dashboard with progress tracker.

- [ ] **Step 1: Implement `lmsService.js` and `CourseCard.jsx`**
API functions for `getCourses(params)`, `getCourse(id)`, `enrollInCourse(id)`, `getMyEnrollments()`, `updateProgress(id, progress)`.
CourseCard displays thumbnail, title, category badge, level pill, price, instructor headline, and enroll button.

- [ ] **Step 2: Implement `CourseListPage.jsx`**
Hero banner, category filter pills, keyword search input, level dropdown filter, and responsive course grid with empty state.

- [ ] **Step 3: Implement `CourseDetailPage.jsx`**
Course header, full description, instructor profile card, curriculum preview, and "Enroll Now" / "Already Enrolled - Continue Learning" CTA.

- [ ] **Step 4: Implement `MyEnrollmentsPage.jsx`**
Lists student's enrolled courses with dynamic `ProgressBar`, enrollment date, and interactive progress slider allowing student to simulate learning completion.

- [ ] **Step 5: Verify build & commit**
Run: `npm run build` in `frontend/`
Expected: Clean build.
```bash
git add frontend/src/
git commit -m "feat(frontend): implement course catalog, course details and student enrollment UI"
```

---

### Task 11: Instructor Course Management UI

**Files:**
- Create: `frontend/src/components/lms/CourseFormModal.jsx`
- Create: `frontend/src/pages/instructor/InstructorCoursesPage.jsx`
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- Consumes: `lmsService.js` (`createCourse`, `updateCourse`, `deleteCourse`, `getCourseStudents`).
- Produces: Instructor course CRUD interface and enrolled student roster modal.

- [ ] **Step 1: Implement `CourseFormModal.jsx`**
Modal supporting both Create and Edit modes: title, category selector, level, price, status (`draft` / `published`), and description.

- [ ] **Step 2: Implement `InstructorCoursesPage.jsx`**
Table / card view of instructor's courses with stats (enrolled count), actions (Edit, Delete with confirmation, "View Students" modal).

- [ ] **Step 3: Implement Enrolled Students Roster view**
Modal showing students enrolled in the selected course, their enrollment date, and their current completion progress.

- [ ] **Step 4: Verify build & commit**
Run: `npm run build` in `frontend/`
Expected: Clean build.
```bash
git add frontend/src/
git commit -m "feat(frontend): implement instructor course management UI and student roster view"
```

---

### Task 12: Role-Based Dashboards & Visual Reports (Admin, Instructor, Student)

**Files:**
- Create: `frontend/src/services/reportService.js`
- Create: `frontend/src/components/common/StatCard.jsx`
- Create: `frontend/src/pages/dashboard/AdminDashboard.jsx`
- Create: `frontend/src/pages/dashboard/InstructorDashboard.jsx`
- Create: `frontend/src/pages/dashboard/StudentDashboard.jsx`
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- Consumes: `/api/reports/admin/`, `/api/reports/instructor/`, `/api/reports/student/`, `/api/users/`.
- Produces: 3 role-tailored dashboard pages with summary cards, tables, and distribution charts.

- [ ] **Step 1: Implement `reportService.js` and `StatCard.jsx`**
`getAdminReport()`, `getInstructorReport()`, `getStudentReport()`.
`StatCard` component with numerical metric, trend indicator, icon, and label.

- [ ] **Step 2: Implement `AdminDashboard.jsx`**
Summary cards (Total Users, Total Courses, Total Enrollments, Completion Rate).
Role distribution bar (Students vs Instructors vs Admins).
User management table with search and instant role upgrade action.
Recent activity feed.

- [ ] **Step 3: Implement `InstructorDashboard.jsx` & `StudentDashboard.jsx`**
Instructor dashboard: course count, student count, average student progress, quick action to create course.
Student dashboard: active courses, completed courses count, overall progress ring, continue learning shortcuts.

- [ ] **Step 4: Verify build & commit**
Run: `npm run build` in `frontend/`
Expected: Clean build.
```bash
git add frontend/src/
git commit -m "feat(frontend): build role-tailored dashboards and analytics views"
```

---

### Task 13: End-to-End System Integration, Verification & Submission Assets

**Files:**
- Create: `README.md`
- Create: `docs/screenshots/` (store verification screenshots)
- Modify: `backend/lms_backend/settings.py`

**Interfaces:**
- Consumes: All backend and frontend components.
- Produces: Comprehensive `README.md`, verified running servers, live screenshots of Login, Dashboard, and Course pages.

- [ ] **Step 1: Run full test suite on Django backend**
Run: `python backend/manage.py test`
Expected: All tests pass (0 failures, 0 errors).

- [ ] **Step 2: Run frontend production build test**
Run: `npm run build` in `frontend/`
Expected: 0 errors.

- [ ] **Step 3: Launch dev servers and perform end-to-end browser verification**
Start backend on port 8000 and frontend on port 5173.
Verify Login with `admin`, `instructor_jane`, `student_alex`.
Verify Course Enrollment, Progress update, Course Creation, and Dashboard metrics.
Capture screenshots of Login, Admin Dashboard, Instructor Management, and Course Catalog.

- [ ] **Step 4: Create comprehensive `README.md`**
Include:
- Project title & overview
- Architecture and Tech Stack details
- Prerequisites & Step-by-step Setup instructions (Backend & Frontend)
- Pre-seeded demo credentials for Admin, Instructor, and Student
- Complete API Documentation table
- Embedded screenshots

- [ ] **Step 5: Final Git commit**
```bash
git add .
git commit -m "docs: finalize project README and submission assets"
```
