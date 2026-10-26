import { useState, useEffect } from 'react';
import { User, Mail, Phone, BookOpen, Briefcase, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import Sidebar from '../../components/common/Sidebar';
import Alert from '../../components/common/Alert';

const ROLE_COLORS = { admin: 'badge-danger', instructor: 'badge-warning', student: 'badge-success' };

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    bio: '', phone: '', headline: '', expertise: '', education: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    authService.getProfile().then((res) => {
      const data = res.data;
      setProfile(data);
      setForm({
        bio: data.bio || '',
        phone: data.phone || '',
        headline: data.headline || '',
        expertise: data.expertise || '',
        education: data.education || '',
      });
      setLoading(false);
    });
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);
    try {
      await authService.updateProfile(form);
      await refreshUser();
      setAlert({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const initials = user
    ? ((user.first_name || '')[0] || '') + ((user.last_name || '')[0] || '') || user.username[0]
    : '?';

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <main className="main-content"><div className="loading-center"><div className="spinner" /></div></main>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">View and update your personal information</p>
        </div>

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          {/* Identity Card */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', fontWeight: 700, color: '#fff', margin: '0 auto 1rem',
              }}
            >
              {initials.toUpperCase()}
            </div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
            </h2>
            <span className={`badge ${ROLE_COLORS[user?.role] || 'badge-muted'}`} style={{ fontSize: '0.85rem', padding: '0.3rem 0.9rem' }}>
              {user?.role}
            </span>

            <div className="divider" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
              {[
                { icon: User, label: 'Username', value: user?.username },
                { icon: Mail, label: 'Email', value: user?.email },
                { icon: Phone, label: 'Phone', value: profile?.phone || '—' },
                { icon: Briefcase, label: 'Headline', value: profile?.headline || '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Icon size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edit Form */}
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Edit Profile</h3>

            {alert && <Alert type={alert.type} message={alert.message} dismissible onDismiss={() => setAlert(null)} />}

            <form onSubmit={handleSave} style={{ marginTop: alert ? '1rem' : 0 }}>
              <div className="form-group">
                <label className="form-label">Headline / Title</label>
                <input name="headline" type="text" className="form-control"
                  placeholder="e.g. Senior Developer, CS Student" value={form.headline} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea name="bio" className="form-control" rows={4}
                  placeholder="Tell us about yourself..." value={form.bio} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input name="phone" type="tel" className="form-control"
                  placeholder="+1 234 567 8900" value={form.phone} onChange={handleChange} />
              </div>

              {user?.role === 'instructor' && (
                <div className="form-group">
                  <label className="form-label">Expertise / Skills</label>
                  <input name="expertise" type="text" className="form-control"
                    placeholder="e.g. Python, Django, Machine Learning" value={form.expertise} onChange={handleChange} />
                </div>
              )}

              {user?.role === 'student' && (
                <div className="form-group">
                  <label className="form-label">Education</label>
                  <input name="education" type="text" className="form-control"
                    placeholder="e.g. B.Sc. Computer Science, MIT" value={form.education} onChange={handleChange} />
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
