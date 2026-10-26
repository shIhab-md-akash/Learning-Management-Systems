import { useCallback, useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import { reportService } from '../../services/reportService';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import Alert from '../../components/common/Alert';
import UserTable from '../../components/lms/UserTable';

const ROLE_COLORS = { student: 'var(--success)', instructor: 'var(--warning)', admin: 'var(--danger)' };

export default function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    reportService.getAdminReport().then((r) => setReport(r.data)).catch(() => setError('Could not load report.'));
  }, []);
  useEffect(load, [load]);

  if (error) return <Shell><Alert type="danger" message={error} /></Shell>;
  if (!report) return <Shell><div className="loading-center"><div className="spinner" /></div></Shell>;

  const roleTotal = Object.values(report.role_counts).reduce((a, b) => a + b, 0) || 1;

  return (
    <Shell>
      <div className="grid grid-4 mb-6">
        <StatCard icon={Users} value={report.total_users} label="Total Users" color="#6366f1" />
        <StatCard icon={BookOpen} value={report.total_courses} label="Total Courses" color="#0ea5e9" />
        <StatCard icon={GraduationCap} value={report.total_enrollments} label="Total Enrollments" color="#10b981" />
        <StatCard icon={TrendingUp} value={`${report.completion_rate}%`} label="Completion Rate" color="#f59e0b" />
      </div>

      <div className="grid grid-2 mb-6">
        <div className="card">
          <h3 className="mb-4">Role distribution</h3>
          <div style={{ display: 'flex', height: 14, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
            {Object.entries(report.role_counts).map(([role, n]) => (
              <div key={role} title={`${role}: ${n}`} style={{ width: `${(n / roleTotal) * 100}%`, background: ROLE_COLORS[role] }} />
            ))}
          </div>
          <div className="flex gap-4 flex-wrap mt-4">
            {Object.entries(report.role_counts).map(([role, n]) => (
              <span key={role} className="text-sm">
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: ROLE_COLORS[role], marginRight: 6 }} />
                {role}s: <b>{n}</b>
              </span>
            ))}
          </div>
          <p className="text-sm text-muted mt-4">
            Courses: {report.published_courses} published · {report.draft_courses} draft
          </p>
        </div>

        <div className="card">
          <h3 className="mb-4">Recent activity</h3>
          {report.recent_enrollments.length === 0 && <p className="text-muted text-sm">No enrollments yet.</p>}
          {report.recent_enrollments.map((e) => (
            <div key={e.id} className="flex-between text-sm" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span><b>{e.student__username}</b> enrolled in {e.course__title}</span>
              <span className="text-muted">{new Date(e.enrolled_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>

      <h3 className="mb-4">User management</h3>
      <UserTable onChanged={load} />
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">System-wide overview.</p>
        </div>
        {children}
      </main>
    </div>
  );
}
