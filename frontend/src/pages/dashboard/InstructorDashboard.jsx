import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, TrendingUp, Plus } from 'lucide-react';
import { reportService } from '../../services/reportService';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import Alert from '../../components/common/Alert';
import ProgressBar from '../../components/lms/ProgressBar';

export default function InstructorDashboard() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    reportService.getInstructorReport().then((r) => setReport(r.data)).catch(() => setError('Could not load report.'));
  }, []);

  const avg = report && report.course_breakdown.length
    ? Math.round(report.course_breakdown.reduce((s, c) => s + c.average_progress, 0) / report.course_breakdown.length)
    : 0;

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header flex-between">
          <div>
            <h1 className="page-title">Instructor Dashboard</h1>
            <p className="page-subtitle">How your courses are performing.</p>
          </div>
          <Link to="/instructor/courses" className="btn btn-primary"><Plus size={16} /> Create course</Link>
        </div>

        {error && <Alert type="danger" message={error} />}
        {!report && !error && <div className="loading-center"><div className="spinner" /></div>}

        {report && (
          <>
            <div className="grid grid-3 mb-6">
              <StatCard icon={BookOpen} value={report.my_courses_count} label="My Courses" color="#6366f1" />
              <StatCard icon={Users} value={report.total_students_enrolled} label="Enrolled Students" color="#10b981" />
              <StatCard icon={TrendingUp} value={`${avg}%`} label="Avg. Student Progress" color="#f59e0b" />
            </div>

            <div className="card">
              <h3 className="mb-4">Course breakdown</h3>
              {report.course_breakdown.length === 0 ? (
                <p className="text-muted">No courses yet — create one to get started.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>Course</th><th>Status</th><th>Students</th><th style={{ width: '30%' }}>Avg. progress</th></tr></thead>
                    <tbody>
                      {report.course_breakdown.map((c) => (
                        <tr key={c.id}>
                          <td><Link to={`/courses/${c.id}`} style={{ color: 'inherit' }}>{c.title}</Link></td>
                          <td><span className={`badge ${c.status === 'published' ? 'badge-success' : 'badge-muted'}`}>{c.status}</span></td>
                          <td>{c.enrolled_students}</td>
                          <td><ProgressBar value={Math.round(c.average_progress)} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
