import logging
import time

logger = logging.getLogger(__name__)


class UserActivityLogMiddleware:
    """
    Middleware that logs request activity and adds security headers to every response.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.monotonic()

        # Log the incoming request
        user_repr = getattr(request, "user", None)
        if user_repr and hasattr(user_repr, "username") and user_repr.is_authenticated:
            user_str = f"user={user_repr.username}"
        else:
            user_str = "anonymous"

        logger.debug(
            "[LMS] %s %s (%s)",
            request.method,
            request.path,
            user_str,
        )

        response = self.get_response(request)

        duration_ms = (time.monotonic() - start_time) * 1000

        # Log the completed response
        logger.debug(
            "[LMS] %s %s -> %s (%.1fms)",
            request.method,
            request.path,
            response.status_code,
            duration_ms,
        )

        # Add security headers
        response["X-Content-Type-Options"] = "nosniff"
        response["X-Frame-Options"] = "DENY"
        response["Referrer-Policy"] = "strict-origin-when-cross-origin"

        return response
