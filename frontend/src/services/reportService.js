import api from './api';

export const reportService = {
  getAdminReport: () => api.get('/api/reports/admin/'),
  getInstructorReport: () => api.get('/api/reports/instructor/'),
  getStudentReport: () => api.get('/api/reports/student/'),
};
