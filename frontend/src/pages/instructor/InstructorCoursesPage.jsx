import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Users, X } from 'lucide-react';
import { lmsService } from '../../services/lmsService';
import Sidebar from '../../components/common/Sidebar';
import Alert from '../../components/common/Alert';
import ProgressBar from '../../components/lms/ProgressBar';
import CourseFormModal from '../../components/lms/CourseFormModal';

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [roster, setRoster] = useState(null); // { course, students }
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    lmsService
      .getCourses({ my_courses: 'true' })
      .then((r) => setCourses(r.data))
      .catch(() => setAlert({ type: 'danger', message: 'Could not load your courses.' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    lmsService.getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, [load]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (c) => { setEditing(c); setFormOpen(true); };

  const onSaved = (message) => {
    setFormOpen(false);
    setAlert({ type: 'success', message });
    load();
  };

  const remove = async () => {
    try {
      await lmsService.deleteCourse(confirmDelete.id);
      setAlert({ type: 'success', message: 'Course deleted.' });
      setConfirmDelete(null);
      load();
    } catch {
      setAlert({ type: 'danger', message: 'Could not delete course.' });
      setConfirmDelete(null);
    }
  };

  const viewStudents = async (course) => {
    try {
      const { data } = await lmsService.getCourseStudents(course.id);
      setRoster({ course, students: data });
    } catch {
      setAlert({ type: 'danger', message: 'Could not load students.' });
    }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header flex-between">
          <div>
            <h1 className="page-title">My Courses</h1>
            <p className="page-subtitle">Create, edit and manage your courses.</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> New Course</button>
        </div>

        {alert && <Alert {...alert} dismissible onDismiss={() => setAlert(null)} />}

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧑‍🏫</div>
            <h3>You haven't created any courses yet</h3>
            <button className="btn btn-primary mt-4" onClick={openCreate}>Create your first course</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Title</th><th>Category</th><th>Level</th><th>Price</th><th>Status</th><th>Enrolled</th><th className="text-right">Actions</th></tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td><Link to={`/courses/${c.id}`} style={{ color: 'inherit' }}>{c.title}</Link></td>
                    <td>{c.category?.name || '—'}</td>
                    <td>{c.level}</td>
                    <td>{Number(c.price) === 0 ? 'Free' : `$${Number(c.price).toFixed(2)}`}</td>
                    <td><span className={`badge ${c.status === 'published' ? 'badge-success' : 'badge-muted'}`}>{c.status}</span></td>
                    <td>{c.enrollments_count}</td>
                    <td className="text-right">
                      <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => viewStudents(c)} title="View students"><Users size={14} /></button>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)} title="Edit"><Pencil size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(c)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {formOpen && (
          <CourseFormModal course={editing} categories={categories} onClose={() => setFormOpen(false)} onSaved={onSaved} />
        )}

        {confirmDelete && (
          <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"><h2 className="modal-title">Delete course?</h2></div>
              <p className="text-secondary mb-6">
                “{confirmDelete.title}” and all of its enrollments will be permanently removed.
              </p>
              <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={remove}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {roster && (
          <div className="modal-overlay" onClick={() => setRoster(null)}>
            <div className="modal" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Students — {roster.course.title}</h2>
                <button className="modal-close" onClick={() => setRoster(null)} aria-label="Close"><X size={18} /></button>
              </div>
              {roster.students.length === 0 ? (
                <p className="text-muted">No students have enrolled yet.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>Student</th><th>Enrolled</th><th style={{ width: '35%' }}>Progress</th></tr></thead>
                    <tbody>
                      {roster.students.map((e) => (
                        <tr key={e.id}>
                          <td>{e.student.username}<div className="text-xs text-muted">{e.student.email}</div></td>
                          <td>{new Date(e.enrolled_at).toLocaleDateString()}</td>
                          <td><ProgressBar value={e.progress} showLabel={false} size="sm" /> <span className="text-xs text-muted">{e.progress}%</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
