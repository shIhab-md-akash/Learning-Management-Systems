from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    CourseViewSet,
    EnrollCourseView,
    MyEnrollmentsView,
    UpdateProgressView,
    CourseStudentsView,
    AdminReportView,
    InstructorReportView,
    StudentReportView,
)

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"courses", CourseViewSet, basename="course")

urlpatterns = [
    path("reports/admin/", AdminReportView.as_view(), name="admin_report"),
    path("reports/instructor/", InstructorReportView.as_view(), name="instructor_report"),
    path("reports/student/", StudentReportView.as_view(), name="student_report"),
    path("lms/courses/<int:course_id>/enroll/", EnrollCourseView.as_view(), name="course_enroll"),
    path("lms/enrollments/my/", MyEnrollmentsView.as_view(), name="my_enrollments"),
    path("lms/enrollments/<int:pk>/progress/", UpdateProgressView.as_view(), name="update_progress"),
    path("lms/courses/<int:course_id>/students/", CourseStudentsView.as_view(), name="course_students"),
    path("lms/", include(router.urls)),
]

