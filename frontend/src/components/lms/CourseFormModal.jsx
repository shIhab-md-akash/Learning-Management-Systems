import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { lmsService } from '../../services/lmsService';
import Alert from '../common/Alert';

const EMPTY = { title: '', description: '', category_id: '', level: 'beginner', price: '0', status: 'published' };

export default function CourseFormModal({ course, categories, onClose, onSaved }) {
  const editing = !!course;
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (course) {
      setForm({
        title: course.title,
        description: course.description,
        category_id: course.category?.id ?? '',
        level: course.level,
        price: String(course.price),
        status: course.status,
      });
    } else {
      setForm(EMPTY);
    }
  }, [course]);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = { ...form, category_id: form.category_id === '' ? null : Number(form.category_id) };
    try {
      if (editing) await lmsService.updateCourse(course.id, payload);
      else await lmsService.createCourse(payload);
      onSaved(editing ? 'Course updated.' : 'Course created.');
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.entries(data).map(([k, v]) => `${k}: ${[].concat(v).join(' ')}`).join(' | ') : 'Could not save course.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{editing ? 'Edit Course' : 'Create Course'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {error && <Alert type="danger" message={error} />}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input name="title" className="form-control" value={form.title} onChange={change} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-control" rows={4} value={form.description} onChange={change} required />
          </div>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select name="category_id" className="form-control" value={form.category_id} onChange={change}>
                <option value="">— None —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Level</label>
              <select name="level" className="form-control" value={form.level} onChange={change}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Price (USD)</label>
              <input name="price" type="number" min="0" step="0.01" className="form-control" value={form.price} onChange={change} required />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-control" value={form.status} onChange={change}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Course'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
