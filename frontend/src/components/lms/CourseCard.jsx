import { Link } from 'react-router-dom';
import { BookOpen, User, DollarSign } from 'lucide-react';

const LEVEL_COLORS = {
  beginner: 'badge-success',
  intermediate: 'badge-warning',
  advanced: 'badge-danger',
};

const THUMB_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #0ea5e9, #6366f1)',
  'linear-gradient(135deg, #10b981, #0ea5e9)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
];

export default function CourseCard({ course, index = 0, onEnroll, enrolled }) {
  const gradient = THUMB_GRADIENTS[index % THUMB_GRADIENTS.length];
  const levelClass = LEVEL_COLORS[course.level] || 'badge-muted';

  return (
    <div className="course-card">
      {/* Thumbnail */}
      <div className="course-card-thumb" style={{ background: gradient }}>
        <BookOpen size={48} style={{ color: 'rgba(255,255,255,0.8)' }} />
      </div>

      {/* Body */}
      <div className="course-card-body">
        {/* Category + Level */}
        <div className="course-card-meta">
          {course.category?.name && (
            <span className="badge badge-primary">{course.category.name}</span>
          )}
          <span className={`badge ${levelClass}`}>{course.level}</span>
          {course.status === 'draft' && (
            <span className="badge badge-muted">Draft</span>
          )}
        </div>

        {/* Title */}
        <Link to={`/courses/${course.id}`} className="course-card-title" style={{ textDecoration: 'none', color: 'inherit' }}>
          {course.title}
        </Link>

        {/* Instructor */}
        {course.instructor && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '8px',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
            }}
          >
            <User size={13} />
            {course.instructor.first_name
              ? `${course.instructor.first_name} ${course.instructor.last_name}`
              : course.instructor.username}
          </div>
        )}

        {/* Footer */}
        <div className="course-card-footer">
          <div>
            {Number(course.price) === 0 ? (
              <span className="course-price free">Free</span>
            ) : (
              <span className="course-price">${Number(course.price).toFixed(2)}</span>
            )}
          </div>

          {onEnroll && (
            <button
              className={`btn ${enrolled ? 'btn-ghost' : 'btn-primary'} btn-sm`}
              onClick={() => !enrolled && onEnroll(course.id)}
              disabled={enrolled}
            >
              {enrolled ? 'Enrolled ✓' : 'Enroll'}
            </button>
          )}

          {!onEnroll && (
            <Link to={`/courses/${course.id}`} className="btn btn-secondary btn-sm">
              View
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
