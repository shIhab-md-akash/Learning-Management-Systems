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
