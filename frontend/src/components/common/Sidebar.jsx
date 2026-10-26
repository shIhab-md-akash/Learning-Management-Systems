import { NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen, LayoutDashboard, Users, GraduationCap,
  BookMarked, LogOut, User, BarChart2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/courses', icon: BookOpen, label: 'Course Catalog' },
  { to: '/admin/users', icon: Users, label: 'Manage Users' },
];

const instructorLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/courses', icon: BookOpen, label: 'Course Catalog' },
  { to: '/instructor/courses', icon: BookMarked, label: 'My Courses' },
];

const studentLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/courses', icon: BookOpen, label: 'Course Catalog' },
  { to: '/my-enrollments', icon: GraduationCap, label: 'My Enrollments' },
];

function getLinks(role) {
  if (role === 'admin') return adminLinks;
  if (role === 'instructor') return instructorLinks;
  return studentLinks;
}

function getInitials(user) {
  if (!user) return '?';
  const fn = user.first_name || '';
  const ln = user.last_name || '';
  if (fn && ln) return `${fn[0]}${ln[0]}`.toUpperCase();
  return (user.username || '?')[0].toUpperCase();
}

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const links = getLinks(role);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleBadgeColor = {
    admin: 'badge-danger',
    instructor: 'badge-warning',
    student: 'badge-success',
  }[role] || 'badge-muted';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <NavLink to="/dashboard" className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <BookOpen size={18} />
        </div>
        <span className="sidebar-logo-text">LearnHub</span>
      </NavLink>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: '1.5rem' }}>Account</div>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar-link${isActive ? ' active' : ''}`
          }
        >
          <User size={18} />
          Profile
        </NavLink>
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={handleLogout} title="Click to logout">
          <div className="sidebar-avatar">{getInitials(user)}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-username">{user?.username || 'User'}</div>
            <div className="sidebar-role">
              <span className={`badge ${roleBadgeColor}`}>{role}</span>
            </div>
          </div>
          <LogOut size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}
