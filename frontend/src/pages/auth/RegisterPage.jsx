import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/common/Alert';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '', email: '', password: '', confirm_password: '', role: 'student',
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({ username: form.username, email: form.email, password: form.password, role: form.role });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const firstError = Object.values(data).flat()[0];
        setError(typeof firstError === 'string' ? firstError : 'Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="auth-logo-icon"><BookOpen size={22} /></div>
          <span className="auth-logo-text">LearnHub</span>
        </div>

        <h1 className="auth-title" style={{ fontSize: '1.5rem' }}>Create account</h1>
        <p className="auth-subtitle">Join thousands of learners today</p>

        {error && <Alert type="danger" message={error} dismissible onDismiss={() => setError('')} />}

        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">Username</label>
            <input id="reg-username" name="username" type="text" className="form-control"
              placeholder="Choose a username" value={form.username} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input id="reg-email" name="email" type="email" className="form-control"
              placeholder="your@email.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-role">I want to join as</label>
            <select id="reg-role" name="role" className="form-control" value={form.role} onChange={handleChange}>
              <option value="student">Student — I want to learn</option>
              <option value="instructor">Instructor — I want to teach</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="reg-password" name="password" type={showPw ? 'text' : 'password'}
                className="form-control" placeholder="At least 8 characters"
                value={form.password} onChange={handleChange} required minLength={8}
                style={{ paddingRight: '2.75rem' }} />
              <button type="button" onClick={() => setShowPw((s) => !s)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex'
                }} aria-label="Toggle password visibility">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <input id="reg-confirm" name="confirm_password" type="password" className="form-control"
              placeholder="Repeat your password" value={form.confirm_password} onChange={handleChange} required />
          </div>

          <button id="register-submit" type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
