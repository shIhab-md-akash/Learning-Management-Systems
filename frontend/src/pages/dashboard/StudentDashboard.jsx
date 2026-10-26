import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, PlayCircle } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { lmsService } from '../../services/lmsService';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import Alert from '../../components/common/Alert';
import ProgressBar from '../../components/lms/ProgressBar';

function ProgressRing({ value }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={`Overall progress ${value}%`}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="12" />
      <circle
        cx="70" cy="70" r={r} fill="none" stroke="var(--primary)" strokeWidth="12" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 70 70)"
      />
      <text x="70" y="76" textAnchor="middle" fill="var(--text-primary)" fontSize="26" fontWeight="800">{value}%</text>
    </svg>
  );
}

export default function StudentDashboard() {
  const [report, setReport] = useState(null);
  const [active, setActive] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([reportService.getStudentReport(), lmsService.getMyEnrollments()])
      .then(([r, e]) => {
        setReport(r.data);
        setActive(e.data.filter((x) => x.status === 'active').slice(0, 4));
      })
      .catch(() => setError('Could not load your dashboard.'));
  }, []);

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle">Your learning at a glance.</p>
        </div>

        {error && <Alert type="danger" message={error} />}
        {!report && !error && <div className="loading-center"><div className="spinner" /></div>}

        {report && (
          <>
            <div className="grid grid-3 mb-6">
              <StatCard icon={PlayCircle} value={report.in_progress_count} label="Active Courses" color="#6366f1" />
              <StatCard icon={CheckCircle2} value={report.completed_courses_count} label="Completed Courses" color="#10b981" />
              <StatCard icon={BookOpen} value={report.enrolled_courses_count} label="Total Enrolled" color="#0ea5e9" />
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
              <div className="card flex-center" style={{ flexDirection: 'column', gap: 8 }}>
                <ProgressRing value={Math.round(report.average_progress)} />
                <div className="text-muted text-sm">Overall progress</div>
              </div>

              <div className="card">
                <h3 className="mb-4">Continue learning</h3>
                {active.length === 0 ? (
                  <p className="text-muted">
                    No active courses. <Link to="/courses" style={{ color: 'var(--primary)' }}>Browse the catalog</Link>.
                  </p>
                ) : (
                  active.map((e) => (
                    <div key={e.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <div className="flex-between mb-4">
                        <Link to={`/courses/${e.course.id}`} className="font-semibold" style={{ color: 'inherit' }}>{e.course.title}</Link>
                        <Link to="/my-enrollments" className="btn btn-secondary btn-sm">Continue</Link>
                      </div>
                      <ProgressBar value={e.progress} showLabel={false} size="sm" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
