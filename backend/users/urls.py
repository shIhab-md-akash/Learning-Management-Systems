from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    LogoutView,
    ForgotPasswordView,
    ResetPasswordView,
    UserProfileView,
    UserListView,
    UserRoleUpdateView,
)

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/forgot-password/", ForgotPasswordView.as_view(), name="forgot_password"),
    path("auth/reset-password/", ResetPasswordView.as_view(), name="reset_password"),
    path("users/profile/", UserProfileView.as_view(), name="user_profile"),
    path("users/", UserListView.as_view(), name="user_list"),
    path("users/<int:pk>/role/", UserRoleUpdateView.as_view(), name="user_role_update"),
]


