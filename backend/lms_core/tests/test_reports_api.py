from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from lms_core.models import Course, Enrollment, Category

User = get_user_model()

class ReportsAPITest(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username="admin_r", email="admin_r@lms.local", password="pass", role="admin"
        )
        self.instructor = User.objects.create_user(
            username="inst_r", email="inst_r@lms.local", password="pass", role="instructor"
        )
        self.student = User.objects.create_user(
            username="stud_r", email="stud_r@lms.local", password="pass", role="student"
        )
        self.category = Category.objects.create(name="Computer Science")
        self.course = Course.objects.create(
            title="Intro to CS",
            description="Basics",
            instructor=self.instructor,
            category=self.category,
            status="published",
        )
        Enrollment.objects.create(student=self.student, course=self.course, progress=50)

    def test_admin_dashboard_report(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get("/api/reports/admin/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["total_users"], 3)
        self.assertEqual(res.data["role_counts"]["student"], 1)
        self.assertEqual(res.data["role_counts"]["instructor"], 1)
        self.assertEqual(res.data["total_courses"], 1)
        self.assertEqual(res.data["total_enrollments"], 1)

    def test_instructor_report(self):
        self.client.force_authenticate(user=self.instructor)
        res = self.client.get("/api/reports/instructor/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["my_courses_count"], 1)
        self.assertEqual(res.data["total_students_enrolled"], 1)

    def test_student_report(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.get("/api/reports/student/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["enrolled_courses_count"], 1)
        self.assertEqual(res.data["average_progress"], 50.0)
