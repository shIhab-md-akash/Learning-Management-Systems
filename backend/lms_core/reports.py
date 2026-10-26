from django.contrib.auth import get_user_model
from django.db.models import Count, Avg, Q
from .models import Course, Enrollment, Category

User = get_user_model()

def get_admin_report_data():
    total_users = User.objects.count()
    role_counts = {
        "admin": User.objects.filter(Q(role="admin") | Q(is_superuser=True)).count(),
        "instructor": User.objects.filter(role="instructor").count(),
        "student": User.objects.filter(role="student").count(),
    }
    total_courses = Course.objects.count()
    published_courses = Course.objects.filter(status="published").count()
    draft_courses = Course.objects.filter(status="draft").count()

    total_enrollments = Enrollment.objects.count()
    active_enrollments = Enrollment.objects.filter(status="active").count()
    completed_enrollments = Enrollment.objects.filter(status="completed").count()

    completion_rate = 0.0
    if total_enrollments > 0:
        completion_rate = round((completed_enrollments / total_enrollments) * 100, 1)

    recent_enrollments = list(
        Enrollment.objects.select_related("student", "course")
        .order_by("-enrolled_at")[:5]
        .values("id", "student__username", "course__title", "status", "progress", "enrolled_at")
    )

    recent_users = list(
        User.objects.order_by("-date_joined")[:5]
        .values("id", "username", "email", "role", "date_joined")
    )

    return {
        "total_users": total_users,
        "role_counts": role_counts,
        "total_courses": total_courses,
        "published_courses": published_courses,
        "draft_courses": draft_courses,
        "total_enrollments": total_enrollments,
        "active_enrollments": active_enrollments,
        "completed_enrollments": completed_enrollments,
        "completion_rate": completion_rate,
        "recent_enrollments": recent_enrollments,
        "recent_users": recent_users,
    }


def get_instructor_report_data(instructor):
    courses = Course.objects.filter(instructor=instructor)
    my_courses_count = courses.count()
    enrollments = Enrollment.objects.filter(course__instructor=instructor)
    total_students_enrolled = enrollments.count()
    completed_count = enrollments.filter(status="completed").count()

    completion_rate = 0.0
    if total_students_enrolled > 0:
        completion_rate = round((completed_count / total_students_enrolled) * 100, 1)

    course_breakdown = []
    for c in courses:
        c_enrollments = c.enrollments.all()
        avg_prog = c_enrollments.aggregate(Avg("progress"))["progress__avg"] or 0
        course_breakdown.append({
            "id": c.id,
            "title": c.title,
            "status": c.status,
            "enrolled_students": c_enrollments.count(),
            "average_progress": round(avg_prog, 1),
        })

    return {
        "my_courses_count": my_courses_count,
        "total_students_enrolled": total_students_enrolled,
        "completed_students_count": completed_count,
        "completion_rate": completion_rate,
        "course_breakdown": course_breakdown,
    }


def get_student_report_data(student):
    enrollments = Enrollment.objects.filter(student=student)
    enrolled_courses_count = enrollments.count()
    completed_courses_count = enrollments.filter(status="completed").count()
    in_progress_count = enrollments.filter(status="active").count()

    avg_prog = enrollments.aggregate(Avg("progress"))["progress__avg"] or 0.0

    return {
        "enrolled_courses_count": enrolled_courses_count,
        "completed_courses_count": completed_courses_count,
        "in_progress_count": in_progress_count,
        "average_progress": round(avg_prog, 1),
    }
