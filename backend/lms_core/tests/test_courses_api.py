from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class CourseAPITest(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username="admin_u", email="admin_u@lms.local", password="pass", role="admin"
        )
        self.instructor = User.objects.create_user(
            username="inst_1", email="inst1@lms.local", password="pass", role="instructor"
        )
        self.student = User.objects.create_user(
            username="stud_1", email="stud1@lms.local", password="pass", role="student"
        )

    def test_student_cannot_create_course(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.post("/api/lms/courses/", {
            "title": "React Basics",
            "description": "Desc"
        })
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

        # Edit own course
        edit_res = self.client.patch(f"/api/lms/courses/{course_id}/", {"title": "Django REST Advanced"})
        self.assertEqual(edit_res.status_code, 200)
        self.assertEqual(edit_res.data["title"], "Django REST Advanced")

    def test_other_instructor_cannot_edit_course(self):
        self.client.force_authenticate(user=self.instructor)
        res = self.client.post("/api/lms/courses/", {
            "title": "Instructor 1 Course",
            "description": "Desc",
            "price": 10.00
        })
        course_id = res.data["id"]

        other_instructor = User.objects.create_user(
            username="inst_2", email="inst2@lms.local", password="pass", role="instructor"
        )
        self.client.force_authenticate(user=other_instructor)
        edit_res = self.client.patch(f"/api/lms/courses/{course_id}/", {"title": "Hacked Title"})
        self.assertEqual(edit_res.status_code, 403)
