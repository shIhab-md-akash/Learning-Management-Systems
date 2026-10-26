from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
)

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "message": "User registered successfully.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)


import secrets
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import PasswordResetToken
from .serializers import (
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ProfileUpdateSerializer,
)

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = User.objects.get(email__iexact=email)

        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(hours=1)
        PasswordResetToken.objects.create(user=user, token=token, expires_at=expires_at)

        reset_link = f"http://localhost:5173/reset-password?token={token}"
        subject = "Password Reset Request - LMS"
        message = (
            f"Hello {user.username},\n\n"
            f"You requested a password reset. Click the link below to set a new password:\n"
            f"{reset_link}\n\n"
            f"This link will expire in 1 hour.\n\n"
            f"If you did not request this, please ignore this email."
        )
        send_mail(subject, message, "noreply@lms.local", [user.email], fail_silently=True)

        return Response(
            {
                "message": "Password reset email sent successfully.",
                "token": token,  # Included for local testing convenience
            },
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token_str = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        token_obj = PasswordResetToken.objects.filter(token=token_str).first()
        if not token_obj or not token_obj.is_valid():
            return Response(
                {"error": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = token_obj.user
        user.set_password(new_password)
        user.save()

        token_obj.is_used = True
        token_obj.save()

        return Response(
            {"message": "Password has been reset successfully. You can now log in with your new password."},
            status=status.HTTP_200_OK,
        )


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)

    def put(self, request):
        return self.update_profile(request, partial=False)

    def patch(self, request):
        return self.update_profile(request, partial=True)

    def update_profile(self, request, partial=False):
        serializer = ProfileUpdateSerializer(
            request.user.profile, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role != "admin" and not user.is_staff and not user.is_superuser:
            return User.objects.none()

        queryset = User.objects.all().select_related("profile").order_by("-date_joined")
        role = self.request.query_params.get("role")
        if role:
            queryset = queryset.filter(role=role)
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                models_Q(username__icontains=search) | models_Q(email__icontains=search)
            )
        return queryset


class UserRoleUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != "admin" and not request.user.is_superuser:
            return Response({"error": "Admin permission required."}, status=status.HTTP_403_FORBIDDEN)

        target_user = generics.get_object_or_404(User, id=pk)
        new_role = request.data.get("role")
        if new_role not in ["admin", "instructor", "student"]:
            return Response({"error": "Invalid role specified."}, status=status.HTTP_400_BAD_REQUEST)

        target_user.role = new_role
        target_user.save()
        return Response(UserSerializer(target_user).data, status=status.HTTP_200_OK)


from django.db.models import Q as models_Q


