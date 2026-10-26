from rest_framework import serializers
from .models import Category, Course
from users.serializers import UserSerializer

class CategorySerializer(serializers.ModelSerializer):
    courses_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "icon", "created_at", "courses_count")
        read_only_fields = ("id", "slug", "created_at", "courses_count")

    def get_courses_count(self, obj):
        return obj.courses.filter(status="published").count()


class CourseSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
        required=False,
        allow_null=True,
    )
    enrollments_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "category",
            "category_id",
            "instructor",
            "thumbnail",
            "price",
            "level",
            "status",
            "created_at",
            "updated_at",
            "enrollments_count",
        )
        read_only_fields = ("id", "slug", "instructor", "created_at", "updated_at", "enrollments_count")

    def get_enrollments_count(self, obj):
        if hasattr(obj, "enrollments"):
            return obj.enrollments.count()
        return 0


from .models import Enrollment

class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    student = UserSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ("id", "student", "course", "enrolled_at", "status", "progress")
        read_only_fields = ("id", "student", "course", "enrolled_at")

