from django.contrib import admin
from .models import Category, Course

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "icon", "created_at")
    prepopulated_fields = {"slug": ("name",)}

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "instructor", "category", "price", "level", "status", "created_at")
    list_filter = ("status", "level", "category")
    search_fields = ("title", "description", "instructor__username")
    prepopulated_fields = {"slug": ("title",)}

from .models import Enrollment

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "status", "progress", "enrolled_at")
    list_filter = ("status", "enrolled_at")
    search_fields = ("student__username", "course__title")

