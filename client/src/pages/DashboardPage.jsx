import { FolderKanban } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <main className="auth-page">
      <section className="auth-card dashboard-card">
        <p className="eyebrow">Project LOOP</p>
        <h1>Welcome, {user.fullName}</h1>
        {location.state?.successMessage && <p className="form-success" role="status">{location.state.successMessage}</p>}
        <p>Manage the workspaces and teams you belong to.</p>
        <div className="dashboard-actions"><button type="button" onClick={() => navigate('/workspaces')}><FolderKanban size={18} /> My Workspaces</button></div>
      </section>
    </main>
  );
}

export default DashboardPage;
