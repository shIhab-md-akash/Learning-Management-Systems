import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/common/Alert';

const DEMO_CREDS = [
  { label: 'Admin', username: 'admin', password: 'admin123', cls: 'demo-btn-admin' },
  { label: 'Instructor', username: 'instructor_jane', password: 'pass123', cls: 'demo-btn-instructor' },
  { label: 'Student', username: 'student_alex', password: 'pass123', cls: 'demo-btn-student' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.non_field_errors?.[0] ||
          'Invalid credentials. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (cred) => {
    setForm({ username: cred.username, password: cred.password });
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <BookOpen size={22} />
          </div>
          <span className="auth-logo-text">LearnHub</span>
        </div>

        <h1 className="auth-title" style={{ fontSize: '1.5rem' }}>Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue learning</p>

        {/* Demo quick-login buttons */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>
            Quick demo login:
          </p>
          <div className="demo-creds">
            {DEMO_CREDS.map((c) => (
              <button key={c.label} className={`demo-btn ${c.cls}`} onClick={() => fillDemo(c)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {error && <Alert type="danger" message={error} dismissible onDismiss={() => setError('')} />}

        <form onSubmit={handleSubmit} style={{ marginTop: error ? '1rem' : 0 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">Username</label>
            <input
              id="login-username"
              name="username"
              type="text"
              className="form-control"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                name="password"
                type={showPw ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center',
                }}
                aria-label="Toggle password visibility"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.85rem' }}>
              Forgot password?
            </Link>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
