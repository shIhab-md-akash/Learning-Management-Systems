import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { lmsService } from '../../services/lmsService';
import Sidebar from '../../components/common/Sidebar';
import Alert from '../../components/common/Alert';
import ProgressBar from '../../components/lms/ProgressBar';

const STATUS_BADGE = { active: 'badge-info', completed: 'badge-success', dropped: 'badge-muted' };

export default function MyEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    lmsService
      .getMyEnrollments()
      .then((r) => setEnrollments(r.data))
      .catch(() => setAlert({ type: 'danger', message: 'Could not load enrollments.' }))
      .finally(() => setLoading(false));
  }, []);

  // Update the slider locally while dragging; save to the API on release.
  const setLocal = (id, progress) =>
    setEnrollments((list) => list.map((e) => (e.id === id ? { ...e, progress } : e)));

  const save = async (id, progress) => {
    try {
      const { data } = await lmsService.updateProgress(id, progress);
      setEnrollments((list) => list.map((e) => (e.id === id ? data : e)));
    } catch {
      setAlert({ type: 'danger', message: 'Could not save progress.' });
    }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">My Enrollments</h1>
          <p className="page-subtitle">Track your learning progress.</p>
        </div>

        {alert && <Alert {...alert} dismissible onDismiss={() => setAlert(null)} />}

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : enrollments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎓</div>
            <h3>You haven't enrolled in any course yet</h3>
            <Link to="/courses" className="btn btn-primary mt-4">Browse courses</Link>
          </div>
        ) : (
          <div className="grid grid-auto">
            {enrollments.map((e) => (
              <div key={e.id} className="card">
                <div className="flex-between mb-4">
                  <span className={`badge ${STATUS_BADGE[e.status] || 'badge-muted'}`}>{e.status}</span>
                  <span className="text-xs text-muted">Enrolled {new Date(e.enrolled_at).toLocaleDateString()}</span>
                </div>
                <Link to={`/courses/${e.course.id}`} className="font-bold" style={{ color: 'inherit', textDecoration: 'none', display: 'block', marginBottom: '1rem' }}>
                  {e.course.title}
                </Link>
                <ProgressBar value={e.progress} />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={e.progress}
                  aria-label={`Progress for ${e.course.title}`}
                  onChange={(ev) => setLocal(e.id, Number(ev.target.value))}
                  onPointerUp={(ev) => save(e.id, Number(ev.target.value))}
                  onKeyUp={(ev) => save(e.id, Number(ev.target.value))}
                  style={{ width: '100%', marginTop: '10px' }}
                />
                <p className="text-xs text-muted mt-4">Drag the slider to simulate completing lessons.</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
