import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { authService } from '../../services/authService';
import Alert from '../../components/common/Alert';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') || '';

  const [form, setForm] = useState({
    token: tokenFromUrl,
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.new_password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (form.new_password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        token: form.token,
        new_password: form.new_password,
        confirm_password: form.confirm_password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Token may be expired or already used.');
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

        <h1 className="auth-title" style={{ fontSize: '1.5rem' }}>Reset Password</h1>
        <p className="auth-subtitle">Enter your new password below</p>

        {error && <Alert type="danger" message={error} dismissible onDismiss={() => setError('')} />}

        {success ? (
          <div style={{ marginTop: '1.5rem' }}>
            <Alert type="success" message="Password reset successfully! Redirecting to login..." />
            <Link to="/login" className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}>
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reset-token">Reset Token</label>
              <input
                id="reset-token"
                name="token"
                type="text"
                className="form-control"
                placeholder="Paste your reset token here"
                value={form.token}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-new-pw">New Password</label>
              <input
                id="reset-new-pw"
                name="new_password"
                type="password"
                className="form-control"
                placeholder="At least 8 characters"
                value={form.new_password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-confirm-pw">Confirm New Password</label>
              <input
                id="reset-confirm-pw"
                name="confirm_password"
                type="password"
                className="form-control"
                placeholder="Repeat new password"
                value={form.confirm_password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="auth-link">
          <Link to="/login">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
