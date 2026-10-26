from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from lms_core.models import Course

User = get_user_model()

class EnrollmentAPITest(APITestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            username="inst_jane", email="jane@lms.local", password="pass", role="instructor"
        )
        self.student = User.objects.create_user(
            username="stud_dan", email="dan@lms.local", password="pass", role="student"
        )
        self.course = Course.objects.create(
            title="FastAPI Fundamentals",
            description="API design",
            instructor=self.instructor,
            price=0,
            status="published",
        )

    def test_student_enrollment_and_progress_flow(self):
        self.client.force_authenticate(user=self.student)
        # 1. Enroll
        enroll_res = self.client.post(f"/api/lms/courses/{self.course.id}/enroll/")
        self.assertEqual(enroll_res.status_code, 201)
        self.assertIn("enrollment", enroll_res.data)

        # 2. Duplicate enrollment returns 400
        dup_res = self.client.post(f"/api/lms/courses/{self.course.id}/enroll/")
        self.assertEqual(dup_res.status_code, 400)
        self.assertIn("error", dup_res.data)

        # 3. View my enrollments
        my_res = self.client.get("/api/lms/enrollments/my/")
        self.assertEqual(my_res.status_code, 200)
        self.assertEqual(len(my_res.data), 1)
        enroll_id = my_res.data[0]["id"]
        self.assertEqual(my_res.data[0]["course"]["title"], "FastAPI Fundamentals")

        # 4. Update progress
        prog_res = self.client.patch(f"/api/lms/enrollments/{enroll_id}/progress/", {"progress": 100})
        self.assertEqual(prog_res.status_code, 200)
        self.assertEqual(prog_res.data["progress"], 100)
        self.assertEqual(prog_res.data["status"], "completed")

    def test_instructor_can_view_course_students(self):
        # Student enrolls
        self.client.force_authenticate(user=self.student)
        self.client.post(f"/api/lms/courses/{self.course.id}/enroll/")

        # Instructor views students
        self.client.force_authenticate(user=self.instructor)
        students_res = self.client.get(f"/api/lms/courses/{self.course.id}/students/")
        self.assertEqual(students_res.status_code, 200)
        self.assertEqual(len(students_res.data), 1)
        self.assertEqual(students_res.data[0]["student"]["username"], "stud_dan")
