from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthAPITest(APITestCase):
    def test_register_and_login_flow(self):
        reg_data = {
            "username": "instructor_bob",
            "email": "bob@lms.local",
            "password": "strongpassword123",
            "confirm_password": "strongpassword123",
            "role": "instructor"
        }
        reg_res = self.client.post("/api/auth/register/", reg_data)
        self.assertEqual(reg_res.status_code, 201)
        self.assertEqual(reg_res.data["user"]["role"], "instructor")

        login_data = {
            "username": "instructor_bob",
            "password": "strongpassword123"
        }
        login_res = self.client.post("/api/auth/login/", login_data)
        self.assertEqual(login_res.status_code, 200)
        self.assertIn("access", login_res.data)
        self.assertIn("refresh", login_res.data)
        self.assertEqual(login_res.data["user"]["role"], "instructor")
        self.assertEqual(login_res.data["user"]["email"], "bob@lms.local")

    def test_register_password_mismatch(self):
        reg_data = {
            "username": "fail_user",
            "email": "fail@lms.local",
            "password": "password123",
            "confirm_password": "password456",
            "role": "student"
        }
        res = self.client.post("/api/auth/register/", reg_data)
        self.assertEqual(res.status_code, 400)

    def test_login_invalid_credentials(self):
        res = self.client.post("/api/auth/login/", {
            "username": "nonexistent",
            "password": "wrongpassword"
        })
        self.assertEqual(res.status_code, 401)
