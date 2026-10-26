import api from './api';

export const lmsService = {
  // ── Categories ────────────────────────────────────────────────────────────
  getCategories: () => api.get('/api/lms/categories/'),

  // ── Courses ───────────────────────────────────────────────────────────────
  getCourses: (params = {}) => api.get('/api/lms/courses/', { params }),
  getCourse: (id) => api.get(`/api/lms/courses/${id}/`),
  createCourse: (data) => api.post('/api/lms/courses/', data),
  updateCourse: (id, data) => api.patch(`/api/lms/courses/${id}/`, data),
  deleteCourse: (id) => api.delete(`/api/lms/courses/${id}/`),

  // ── Enrollments ───────────────────────────────────────────────────────────
  enrollInCourse: (courseId) =>
    api.post(`/api/lms/courses/${courseId}/enroll/`),
  getMyEnrollments: () => api.get('/api/lms/enrollments/my/'),
  updateProgress: (enrollmentId, progress) =>
    api.patch(`/api/lms/enrollments/${enrollmentId}/progress/`, { progress }),

  // ── Instructor ────────────────────────────────────────────────────────────
  getCourseStudents: (courseId) =>
    api.get(`/api/lms/courses/${courseId}/students/`),

  // ── Admin ─────────────────────────────────────────────────────────────────
  getUsers: (params) => api.get('/api/users/', { params }),
  updateUserRole: (userId, role) =>
    api.patch(`/api/users/${userId}/role/`, { role }),
};
