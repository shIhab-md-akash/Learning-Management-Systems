import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, User, Users, Layers, CheckCircle2, PlayCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { lmsService } from '../../services/lmsService';
import Sidebar from '../../components/common/Sidebar';
import Alert from '../../components/common/Alert';

// Curriculum is a static preview (the data model has no lessons table).
const CURRICULUM = [
  'Course introduction & setup',
  'Core concepts and fundamentals',
  'Hands-on guided practice',
  'Building a real-world project',
  'Review, assessment & next steps',
];

export default function CourseDetailPage() {
  const { id } = useParams();
  const { role } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    setLoading(true);
    lmsService
      .getCourse(id)
      .then((r) => setCourse(r.data))
      .catch(() => setAlert({ type: 'danger', message: 'Course not found.' }))
      .finally(() => setLoading(false));
    if (role === 'student') {
      lmsService
        .getMyEnrollments()
        .then((r) => setEnrolled(r.data.some((e) => String(e.course.id) === String(id))))
        .catch(() => {});
    }
  }, [id, role]);

  const handleEnroll = async () => {
    setBusy(true);
    try {
      await lmsService.enrollInCourse(id);
      setEnrolled(true);
      setAlert({ type: 'success', message: 'You are enrolled! Track progress in My Enrollments.' });
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.error || 'Enrollment failed.' });
    } finally {
      setBusy(false);
    }
  };

  const instructor = course?.instructor;
  const instructorName = instructor
    ? instructor.first_name ? `${instructor.first_name} ${instructor.last_name}` : instructor.username
    : '';

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <Link to="/courses" className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={14} /> Back to catalog
        </Link>

        {alert && <Alert {...alert} dismissible onDismiss={() => setAlert(null)} />}

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : !course ? null : (
          <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
            <div>
              <div className="hero">
                <div className="flex gap-2 flex-wrap mb-4">
                  {course.category && <span className="badge badge-primary">{course.category.name}</span>}
                  <span className="badge badge-info">{course.level}</span>
                  {course.status !== 'published' && <span className="badge badge-muted">{course.status}</span>}
                </div>
                <h1 className="hero-title">{course.title}</h1>
                <div className="flex gap-4 flex-wrap text-muted text-sm">
                  <span className="flex gap-2" style={{ alignItems: 'center' }}><User size={14} /> {instructorName}</span>
                  <span className="flex gap-2" style={{ alignItems: 'center' }}><Users size={14} /> {course.enrollments_count} enrolled</span>
                </div>
              </div>

              <div className="card mb-6">
                <h3 className="mb-4">About this course</h3>
                <p className="text-secondary" style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>{course.description}</p>
              </div>

              <div className="card">
                <h3 className="mb-4 flex gap-2" style={{ alignItems: 'center' }}><Layers size={18} /> Curriculum preview</h3>
                {CURRICULUM.map((item, i) => (
                  <div key={item} className="flex gap-3" style={{ alignItems: 'center', padding: '10px 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
                    <PlayCircle size={18} style={{ color: 'var(--primary)' }} />
                    <span>Module {i + 1}: {item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ position: 'sticky', top: '1.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
                {Number(course.price) === 0 ? 'Free' : `$${Number(course.price).toFixed(2)}`}
              </div>

              {role === 'student' ? (
                enrolled ? (
                  <Link to="/my-enrollments" className="btn btn-primary btn-full">
                    <CheckCircle2 size={16} /> Already Enrolled – Continue Learning
                  </Link>
                ) : (
                  <button className="btn btn-primary btn-full btn-lg" onClick={handleEnroll} disabled={busy}>
                    {busy ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )
              ) : (
                <p className="text-muted text-sm">Only student accounts can enroll in courses.</p>
              )}

              {instructor && (
                <div className="mt-6" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <div className="text-xs text-muted mb-4">YOUR INSTRUCTOR</div>
                  <div className="font-semibold">{instructorName}</div>
                  {instructor.profile?.headline && <div className="text-sm text-secondary">{instructor.profile.headline}</div>}
                  {instructor.profile?.bio && <p className="text-sm text-muted mt-4">{instructor.profile.bio}</p>}
                  {instructor.profile?.expertise && <p className="text-xs text-muted mt-4">Expertise: {instructor.profile.expertise}</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
