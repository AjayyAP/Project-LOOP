import { FolderKanban, Plus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { fetchWorkspaces } from '../services/workspaceService';

function WorkspaceListPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadWorkspaces() {
      try {
        setWorkspaces(await fetchWorkspaces());
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load your workspaces.');
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkspaces();
  }, []);

  return (
    <main className="workspace-page">
      <section className="workspace-container">
        <header className="page-header">
          <div><p className="eyebrow">Project LOOP</p><h1>My Workspaces</h1><p>Organize your work with the teams you belong to.</p></div>
          {user.role === 'Admin' && <Link className="button-link" to="/workspaces/new"><Plus size={18} /> Create workspace</Link>}
        </header>
        {isLoading && <p className="page-status">Loading workspaces...</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {!isLoading && !error && workspaces.length === 0 && (
          <section className="empty-state"><FolderKanban size={36} /><h2>No workspaces yet</h2><p>{user.role === 'Admin' ? 'Create your first workspace to get started.' : 'Ask a workspace Admin to add you to a workspace.'}</p>{user.role === 'Admin' && <Link className="button-link" to="/workspaces/new"><Plus size={18} /> Create workspace</Link>}</section>
        )}
        <section className="workspace-grid">
          {workspaces.map((workspace) => (
            <Link className="workspace-card" to={`/workspaces/${workspace.id}`} key={workspace.id}>
              <div className="card-icon"><FolderKanban size={20} /></div>
              <div><h2>{workspace.name}</h2><p>{workspace.description || 'No description provided.'}</p></div>
              <footer><span className={`role-badge role-${workspace.role.toLowerCase()}`}>{workspace.role}</span><span className="member-count"><Users size={16} /> {workspace.memberCount} {workspace.memberCount === 1 ? 'member' : 'members'}</span></footer>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}

export default WorkspaceListPage;
