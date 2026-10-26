from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from lms_core.models import Category, Course, Enrollment

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds the LMS database with realistic demo data for development and grading."

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("Seeding LMS database..."))

        # -- Users ---------------------------------------------------------------
        admin, _ = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@lms.local",
                "role": "admin",
                "first_name": "Site",
                "last_name": "Administrator",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin.set_password("admin123")
        admin.save()

        instructor_jane, _ = User.objects.get_or_create(
            username="instructor_jane",
            defaults={
                "email": "jane@lms.local",
                "role": "instructor",
                "first_name": "Jane",
                "last_name": "Doe",
            },
        )
        instructor_jane.set_password("pass123")
        instructor_jane.save()

        instructor_mark, _ = User.objects.get_or_create(
            username="instructor_mark",
            defaults={
                "email": "mark@lms.local",
                "role": "instructor",
                "first_name": "Mark",
                "last_name": "Stone",
            },
        )
        instructor_mark.set_password("pass123")
        instructor_mark.save()

        student_alex, _ = User.objects.get_or_create(
            username="student_alex",
            defaults={
                "email": "alex@lms.local",
                "role": "student",
                "first_name": "Alex",
                "last_name": "Smith",
            },
        )
        student_alex.set_password("pass123")
        student_alex.save()

        student_sara, _ = User.objects.get_or_create(
            username="student_sara",
            defaults={
                "email": "sara@lms.local",
                "role": "student",
                "first_name": "Sara",
                "last_name": "Johnson",
            },
        )
        student_sara.set_password("pass123")
        student_sara.save()

        # Update profiles
        for user, bio, headline in [
            (instructor_jane, "Full-stack developer with 10+ years experience.", "Senior Django & React Engineer"),
            (instructor_mark, "Data scientist and ML practitioner.", "AI/ML Engineer & Python Expert"),
            (student_alex, "Aspiring backend developer learning Django.", "CS Student"),
            (student_sara, "Frontend enthusiast exploring React and CSS.", "Web Design Student"),
        ]:
            profile = user.profile
            profile.bio = bio
            profile.headline = headline
            profile.save()

        self.stdout.write("  [OK] Created {} users".format(User.objects.count()))

        # -- Categories ----------------------------------------------------------
        cats_data = [
            ("Web Development", "WEB"),
            ("Data Science & AI", "AI"),
            ("Mobile Development", "MOB"),
            ("DevOps & Cloud", "OPS"),
        ]
        categories = {}
        for name, icon in cats_data:
            cat, _ = Category.objects.get_or_create(
                name=name, defaults={"description": "Courses covering {}".format(name), "icon": icon}
            )
            categories[name] = cat

        self.stdout.write("  [OK] Created {} categories".format(Category.objects.count()))

        # -- Courses -------------------------------------------------------------
        courses_data = [
            {
                "title": "Django REST Framework Masterclass",
                "description": (
                    "A deep dive into building production-grade RESTful APIs with Django and DRF. "
                    "Covers authentication, permissions, serializers, viewsets, and deployment."
                ),
                "instructor": instructor_jane,
                "category": categories["Web Development"],
                "level": "intermediate",
                "price": 49.99,
                "status": "published",
            },
            {
                "title": "React 18 & Vite: Modern Frontend Development",
                "description": (
                    "Master React 18 with hooks, context, Suspense, and concurrent mode. "
                    "Build blazing-fast apps powered by Vite and modern CSS design systems."
                ),
                "instructor": instructor_jane,
                "category": categories["Web Development"],
                "level": "beginner",
                "price": 39.99,
                "status": "published",
            },
            {
                "title": "Machine Learning with Python & Scikit-learn",
                "description": (
                    "From linear regression to ensemble methods. Covers data preprocessing, "
                    "model evaluation, hyperparameter tuning, and deployment with FastAPI."
                ),
                "instructor": instructor_mark,
                "category": categories["Data Science & AI"],
                "level": "intermediate",
                "price": 59.99,
                "status": "published",
            },
            {
                "title": "Docker & Kubernetes for Developers",
                "description": (
                    "Containerise your applications, orchestrate with Kubernetes, and build "
                    "automated CI/CD pipelines on AWS EKS and Google GKE."
                ),
                "instructor": instructor_mark,
                "category": categories["DevOps & Cloud"],
                "level": "advanced",
                "price": 69.99,
                "status": "published",
            },
        ]

        created_courses = []
        for data in courses_data:
            course, _ = Course.objects.get_or_create(
                title=data["title"],
                defaults=data,
            )
            created_courses.append(course)

        self.stdout.write("  [OK] Created {} courses".format(Course.objects.count()))

        # -- Enrollments ---------------------------------------------------------
        enrollments_data = [
            (student_alex, created_courses[0], 75),   # Django course - in progress
            (student_alex, created_courses[1], 100),  # React course - completed
            (student_sara, created_courses[0], 30),   # Django course - just started
            (student_sara, created_courses[2], 50),   # ML course - halfway
        ]

        for student, course, progress in enrollments_data:
            enroll, _ = Enrollment.objects.get_or_create(
                student=student,
                course=course,
                defaults={"progress": progress},
            )
            if enroll.progress != progress:
                enroll.progress = progress
                enroll.save()

        self.stdout.write("  [OK] Created {} enrollments".format(Enrollment.objects.count()))

        self.stdout.write(
            self.style.SUCCESS(
                "\nSuccessfully seeded LMS database!\n\n"
                "Demo credentials:\n"
                "  Admin:       username=admin           password=admin123\n"
                "  Instructor:  username=instructor_jane  password=pass123\n"
                "  Instructor:  username=instructor_mark  password=pass123\n"
                "  Student:     username=student_alex    password=pass123\n"
                "  Student:     username=student_sara    password=pass123\n"
            )
        )
