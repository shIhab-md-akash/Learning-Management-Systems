import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail } from 'lucide-react';
import { authService } from '../../services/authService';
import Alert from '../../components/common/Alert';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      // Dev convenience: backend returns token in response for easy testing
      setToken(res.data?.token || '');
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send reset email. Please try again.');
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

        <h1 className="auth-title" style={{ fontSize: '1.5rem' }}>Forgot Password</h1>
        <p className="auth-subtitle">We'll send a reset link to your inbox</p>

        {error && <Alert type="danger" message={error} dismissible onDismiss={() => setError('')} />}

        {sent ? (
          <div style={{ marginTop: '1.5rem' }}>
            <Alert type="success" message="Reset token generated! Check the console or use the token below." />
            {token && (
              <div className="card" style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Reset Token (dev mode — copy to use on reset page):
                </p>
                <code style={{
                  display: 'block', padding: '0.75rem', background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius)', fontSize: '0.75rem',
                  wordBreak: 'break-all', color: 'var(--primary)',
                }}>
                  {token}
                </code>
                <Link
                  to={`/reset-password?token=${token}`}
                  className="btn btn-primary btn-full"
                  style={{ marginTop: '1rem' }}
                >
                  Go to Reset Password →
                </Link>
              </div>
            )}
            <button className="btn btn-ghost btn-full" style={{ marginTop: '0.75rem' }} onClick={() => setSent(false)}>
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} /> Email Address
                </div>
              </label>
              <input
                id="forgot-email"
                type="email"
                className="form-control"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Token'}
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
