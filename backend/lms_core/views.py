from rest_framework import viewsets, permissions, filters
from rest_framework.response import Response
from .models import Category, Course
from .serializers import CategorySerializer, CourseSerializer
from .permissions import (
    IsAdminRole,
    IsInstructorRole,
    IsCourseOwnerOrAdmin,
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [IsAdminRole()]


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "description", "instructor__username", "category__name"]

    def get_queryset(self):
        user = self.request.user
        queryset = Course.objects.select_related("instructor", "category").order_by("-created_at")

        # Allow instructors to filter exclusively by their own courses
        my_courses = self.request.query_params.get("my_courses")
        if my_courses and my_courses.lower() == "true" and user.is_authenticated:
            return queryset.filter(instructor=user)

        # Allow category filter
        category_slug = self.request.query_params.get("category")
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        # Allow level filter
        level = self.request.query_params.get("level")
        if level:
            queryset = queryset.filter(level=level)

        # For unauthenticated or student users, only show published courses
        if not user.is_authenticated or user.role == "student":
            return queryset.filter(status="published")

        # For admin, show all
        if user.role == "admin" or user.is_staff:
            return queryset

        # For instructor viewing general catalog, show published + their own drafts
        return queryset.filter(models_Q(status="published") | models_Q(instructor=user))

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        if self.action == "create":
            return [IsInstructorRole()]
        return [IsCourseOwnerOrAdmin()]

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)


from django.db.models import Q as models_Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from .models import Enrollment
from .serializers import EnrollmentSerializer
from .permissions import IsStudentRole

class EnrollCourseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, course_id):
        if request.user.role != "student":
            return Response(
                {"error": "Only students can enroll in courses."},
                status=status.HTTP_403_FORBIDDEN,
            )

        course = get_object_or_404(Course, id=course_id)
        if Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response(
                {"error": "Already enrolled in this course."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        enrollment = Enrollment.objects.create(student=request.user, course=course)
        return Response(
            {
                "message": "Enrolled successfully.",
                "enrollment": EnrollmentSerializer(enrollment).data,
            },
            status=status.HTTP_201_CREATED,
        )


class MyEnrollmentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        enrollments = (
            Enrollment.objects.filter(student=request.user)
            .select_related("course", "course__instructor", "course__category")
            .order_by("-enrolled_at")
        )
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        enrollment = get_object_or_404(Enrollment, id=pk)
        # Verify student or instructor or admin
        if (
            enrollment.student != request.user
            and enrollment.course.instructor != request.user
            and request.user.role != "admin"
        ):
            return Response(
                {"error": "You do not have permission to update this enrollment."},
                status=status.HTTP_403_FORBIDDEN,
            )

        progress = int(request.data.get("progress", enrollment.progress))
        progress = max(0, min(100, progress))
        enrollment.progress = progress
        if progress >= 100:
            enrollment.status = "completed"
        elif enrollment.status == "completed" and progress < 100:
            enrollment.status = "active"
        enrollment.save()

        return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_200_OK)


class CourseStudentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        if course.instructor != request.user and request.user.role != "admin":
            return Response(
                {"error": "You do not have permission to view students for this course."},
                status=status.HTTP_403_FORBIDDEN,
            )

        enrollments = (
            Enrollment.objects.filter(course=course)
            .select_related("student", "student__profile")
            .order_by("-enrolled_at")
        )
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


from .reports import (
    get_admin_report_data,
    get_instructor_report_data,
    get_student_report_data,
)
from .permissions import IsAdminRole, IsInstructorRole, IsStudentRole

class AdminReportView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        data = get_admin_report_data()
        return Response(data, status=status.HTTP_200_OK)


class InstructorReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != "instructor" and request.user.role != "admin" and not request.user.is_staff:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        data = get_instructor_report_data(request.user)
        return Response(data, status=status.HTTP_200_OK)


class StudentReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != "student" and request.user.role != "admin" and not request.user.is_staff:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        data = get_student_report_data(request.user)
        return Response(data, status=status.HTTP_200_OK)


