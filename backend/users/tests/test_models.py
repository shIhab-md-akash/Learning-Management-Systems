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
