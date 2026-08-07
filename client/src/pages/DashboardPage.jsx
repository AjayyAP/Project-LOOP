import { FolderKanban, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="auth-page">
      <section className="auth-card dashboard-card">
        <p className="eyebrow">Project LOOP</p>
        <h1>Welcome, {user.fullName}</h1>
        {location.state?.successMessage && <p className="form-success" role="status">{location.state.successMessage}</p>}
        <p>Manage the workspaces and teams you belong to.</p>
        <div className="dashboard-actions"><button type="button" onClick={() => navigate('/workspaces')}><FolderKanban size={18} /> My Workspaces</button><button className="secondary-button" type="button" onClick={handleLogout}><LogOut size={18} /> Log out</button></div>
      </section>
    </main>
  );
}

export default DashboardPage;
