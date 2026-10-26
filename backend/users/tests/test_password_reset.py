from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class PasswordResetAndProfileTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="student_clara",
            email="clara@lms.local",
            password="oldpass123",
            role="student"
        )

    def test_forgot_and_reset_password_flow(self):
        # 1. Request reset
        req_res = self.client.post("/api/auth/forgot-password/", {"email": "clara@lms.local"})
        self.assertEqual(req_res.status_code, 200)
        self.assertIn("message", req_res.data)
        self.assertIn("token", req_res.data)
        token = req_res.data["token"]

        # 2. Confirm reset
        confirm_res = self.client.post("/api/auth/reset-password/", {
            "token": token,
            "new_password": "newsecurepass123",
            "confirm_password": "newsecurepass123"
        })
        self.assertEqual(confirm_res.status_code, 200)

        # 3. Verify login with new password
        login_res = self.client.post("/api/auth/login/", {
            "username": "student_clara",
            "password": "newsecurepass123"
        })
        self.assertEqual(login_res.status_code, 200)

    def test_reused_token_rejected(self):
        # Request reset
        req_res = self.client.post("/api/auth/forgot-password/", {"email": "clara@lms.local"})
        token = req_res.data["token"]

        # Use once
        self.client.post("/api/auth/reset-password/", {
            "token": token,
            "new_password": "passOne123",
            "confirm_password": "passOne123"
        })

        # Try to use again
        res = self.client.post("/api/auth/reset-password/", {
            "token": token,
            "new_password": "passTwo123",
            "confirm_password": "passTwo123"
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("error", res.data)

    def test_profile_view_and_update(self):
        self.client.force_authenticate(user=self.user)
        # GET profile
        get_res = self.client.get("/api/users/profile/")
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.data["username"], "student_clara")

        # Update profile
        update_res = self.client.put("/api/users/profile/", {
            "bio": "Passionate learner studying full stack dev",
            "headline": "Junior Software Engineer",
            "phone": "+1234567890",
            "education": "B.S. in Computer Science"
        })
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.data["profile"]["headline"], "Junior Software Engineer")
        self.assertEqual(update_res.data["profile"]["education"], "B.S. in Computer Science")
