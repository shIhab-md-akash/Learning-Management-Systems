import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { lmsService } from '../../services/lmsService';
import { useAuth } from '../../context/AuthContext';
import Alert from '../common/Alert';

const ROLE_BADGE = { admin: 'badge-danger', instructor: 'badge-warning', student: 'badge-success' };

export default function UserTable({ onChanged }) {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    lmsService
      .getUsers(debounced ? { search: debounced } : undefined)
      .then((r) => setUsers(r.data))
      .catch(() => setAlert({ type: 'danger', message: 'Could not load users.' }))
      .finally(() => setLoading(false));
  }, [debounced]);

  const changeRole = async (u, role) => {
    try {
      const { data } = await lmsService.updateUserRole(u.id, role);
      setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, role: data.role } : x)));
      setAlert({ type: 'success', message: `${u.username} is now ${role}.` });
      onChanged?.();
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.error || 'Could not change role.' });
    }
  };

  return (
    <div>
      {alert && <Alert {...alert} dismissible onDismiss={() => setAlert(null)} />}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input className="form-control search-input" placeholder="Search by username or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th><th>Change role</th></tr></thead>
            <tbody>
              {users.length === 0 && <tr><td colSpan="5" className="text-center text-muted">No users found.</td></tr>}
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${ROLE_BADGE[u.role] || 'badge-muted'}`}>{u.role}</span></td>
                  <td>{new Date(u.date_joined).toLocaleDateString()}</td>
                  <td>
                    <select
                      className="form-control"
                      style={{ width: 'auto', padding: '4px 8px' }}
                      value={u.role}
                      disabled={u.id === me?.id}
                      onChange={(e) => changeRole(u, e.target.value)}
                    >
                      <option value="student">student</option>
                      <option value="instructor">instructor</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
