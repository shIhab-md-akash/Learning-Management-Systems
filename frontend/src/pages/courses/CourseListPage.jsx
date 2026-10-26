import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { lmsService } from '../../services/lmsService';
import Sidebar from '../../components/common/Sidebar';
import Alert from '../../components/common/Alert';
import CourseCard from '../../components/lms/CourseCard';

export default function CourseListPage() {
  const { role } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    lmsService.getCategories().then((r) => setCategories(r.data)).catch(() => {});
    if (role === 'student') {
      lmsService
        .getMyEnrollments()
        .then((r) => setEnrolledIds(new Set(r.data.map((e) => e.course.id))))
        .catch(() => {});
    }
  }, [role]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (category) params.category = category;
    if (level) params.level = level;
    lmsService
      .getCourses(params)
      .then((r) => setCourses(r.data))
      .catch(() => setAlert({ type: 'danger', message: 'Could not load courses.' }))
      .finally(() => setLoading(false));
  }, [debouncedSearch, category, level]);

  const handleEnroll = async (courseId) => {
    try {
      await lmsService.enrollInCourse(courseId);
      setEnrolledIds((prev) => new Set(prev).add(courseId));
      setAlert({ type: 'success', message: 'Enrolled successfully!' });
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.error || 'Enrollment failed.' });
    }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="hero">
          <h1 className="hero-title">Explore Our Course Catalog</h1>
          <p className="hero-subtitle">Learn new skills from expert instructors, at your own pace.</p>
        </div>

        {alert && <Alert {...alert} dismissible onDismiss={() => setAlert(null)} />}

        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search size={16} />
            <input
              className="form-control search-input"
              placeholder="Search courses, instructors, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="pill-tabs">
          <button className={`pill-tab${category === '' ? ' active' : ''}`} onClick={() => setCategory('')}>All</button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`pill-tab${category === c.slug ? ' active' : ''}`}
              onClick={() => setCategory(c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>No courses found</h3>
            <p className="text-muted">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-auto">
            {courses.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                index={i}
                enrolled={enrolledIds.has(course.id)}
                onEnroll={role === 'student' ? handleEnroll : undefined}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
