import { BrowserRouter, Navigate, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProfilePage from './pages/profile/ProfilePage';

import CourseListPage from './pages/courses/CourseListPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import MyEnrollmentsPage from './pages/courses/MyEnrollmentsPage';
import InstructorCoursesPage from './pages/instructor/InstructorCoursesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

import AdminDashboard from './pages/dashboard/AdminDashboard';
import InstructorDashboard from './pages/dashboard/InstructorDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';

// Shows the dashboard that matches the signed-in user's role.
function DashboardRouter() {
  const { role } = useAuth();
  if (role === 'admin') return <AdminDashboard />;
  if (role === 'instructor') return <InstructorDashboard />;
  return <StudentDashboard />;
}

function Unauthorized() {
  return (
    <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: 12 }}>
      <h1>403 — Not allowed</h1>
      <p className="text-muted">Your role does not have access to this page.</p>
      <Link to="/dashboard" className="btn btn-primary">Back to dashboard</Link>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: 12 }}>
      <h1>404 — Page not found</h1>
      <Link to="/dashboard" className="btn btn-primary">Go home</Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Any signed-in user */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><CourseListPage /></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute><CourseDetailPage /></ProtectedRoute>} />

          {/* Role specific */}
          <Route path="/my-enrollments" element={<ProtectedRoute allowedRoles={['student']}><MyEnrollmentsPage /></ProtectedRoute>} />
          <Route path="/instructor/courses" element={<ProtectedRoute allowedRoles={['instructor', 'admin']}><InstructorCoursesPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
