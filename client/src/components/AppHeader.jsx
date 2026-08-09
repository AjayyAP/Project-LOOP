import { FolderKanban, LayoutDashboard, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <NavLink className="app-brand" to="/dashboard" aria-label="Project LOOP dashboard">
          <span>LOOP</span>
          <small>Feedback workspace</small>
        </NavLink>
        <nav className="app-navigation" aria-label="Main navigation">
          <NavLink to="/dashboard"><LayoutDashboard size={16} /> Dashboard</NavLink>
          <NavLink to="/workspaces"><FolderKanban size={16} /> Workspaces</NavLink>
        </nav>
        <div className="app-account">
          <div className="app-account-details"><strong>{user?.fullName}</strong><span>{user?.role}</span></div>
          <button type="button" onClick={handleLogout}><LogOut size={16} /> <span>Log out</span></button>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
