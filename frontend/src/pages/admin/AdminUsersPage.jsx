import Sidebar from '../../components/common/Sidebar';
import UserTable from '../../components/lms/UserTable';

export default function AdminUsersPage() {
  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">Search users and change their roles.</p>
        </div>
        <UserTable />
      </main>
    </div>
  );
}
