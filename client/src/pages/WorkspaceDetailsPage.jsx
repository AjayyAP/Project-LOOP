import { ArrowLeft, BarChart3, Bot, BrainCircuit, FileText, FileUp, FolderKanban, MessageSquarePlus, UserPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { addWorkspaceMember, fetchWorkspace, fetchWorkspaceMembers, updateWorkspaceMemberRole } from '../services/workspaceService';
import { importSampleChannel } from '../services/channelImportService';

const sampleChannels = [
  { value: 'Email', label: 'Email' },
  { value: 'Website', label: 'Website' },
  { value: 'Play Store', label: 'Play Store' },
  { value: 'App Store', label: 'App Store' },
  { value: 'Slack', label: 'Slack' },
  { value: 'Twitter/X', label: 'X' },
];

function WorkspaceDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [memberForm, setMemberForm] = useState({ email: '', role: 'Analyst' });
  const [memberError, setMemberError] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [showSampleImportModal, setShowSampleImportModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('Email');
  const [isImportingChannel, setIsImportingChannel] = useState(false);
  const [sampleImportError, setSampleImportError] = useState('');
  const [sampleImportMessage, setSampleImportMessage] = useState('');

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const [nextWorkspace, nextMembers] = await Promise.all([fetchWorkspace(id), fetchWorkspaceMembers(id)]);
        setWorkspace(nextWorkspace);
        setMembers(nextMembers);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load this workspace.');
      } finally {
        setIsLoading(false);
      }
    }
    loadWorkspace();
  }, [id]);

  async function handleAddMember(event) {
    event.preventDefault();
    const email = memberForm.email.trim().toLowerCase();
    if (!email) { setMemberError('Enter the registered email of the person to add.'); return; }
    setMemberError('');
    setIsAddingMember(true);
    try {
      const data = await addWorkspaceMember(id, { email, role: memberForm.role });
      setMembers((current) => [...current, data.data.member]);
      setWorkspace((current) => ({ ...current, memberCount: current.memberCount + 1 }));
      setMemberForm({ email: '', role: 'Analyst' });
    } catch (requestError) {
      setMemberError(requestError.response?.data?.message || 'Unable to add the member.');
    } finally {
      setIsAddingMember(false);
    }
  }

  async function handleRoleChange(memberId, role) {
    setMemberError('');
    try {
      const data = await updateWorkspaceMemberRole(id, memberId, role);
      setMembers((current) => current.map((member) => member.id === memberId ? { ...member, role: data.data.member.role } : member));
    } catch (requestError) {
      setMemberError(requestError.response?.status === 403 ? 'Permission denied.' : requestError.response?.data?.message || 'Unable to update the member role.');
    }
  }

  async function handleSampleChannelImport() {
    setSampleImportError('');
    setSampleImportMessage('');
    setIsImportingChannel(true);
    try {
      const data = await importSampleChannel(id, selectedChannel);
      setSampleImportMessage(data.message || `Imported ${data.data.imported} feedback items successfully.`);
      setShowSampleImportModal(false);
    } catch (requestError) {
      setSampleImportError(requestError.response?.status === 403 ? 'Permission denied.' : requestError.response?.data?.message || 'Unable to import sample channel feedback.');
    } finally {
      setIsImportingChannel(false);
    }
  }

  if (isLoading) return <main className="workspace-page"><p className="page-status">Loading workspace...</p></main>;
  if (error) return <main className="workspace-page"><section className="form-page-card"><p className="form-error" role="alert">{error}</p><Link className="back-link" to="/workspaces"><ArrowLeft size={17} /> My Workspaces</Link></section></main>;

  return (
    <main className="workspace-page"><section className="workspace-container">
      <Link className="back-link" to="/workspaces"><ArrowLeft size={17} /> My Workspaces</Link>
      <header className="details-header"><div className="card-icon"><FolderKanban size={24} /></div><div><p className="eyebrow">Workspace</p><h1>{workspace.name}</h1><p>{workspace.description || 'No description provided.'}</p></div><span className={`role-badge role-${workspace.role.toLowerCase()}`}>{workspace.role}</span></header>
      {location.state?.successMessage && <p className="form-success" role="status">{location.state.successMessage}</p>}
      {sampleImportMessage && <p className="form-success" role="status">{sampleImportMessage}</p>}
      <div className="workspace-actions"><Link className="button-link" to={`/workspaces/${id}/dashboard`}><BarChart3 size={18} /> Dashboard</Link><Link className="button-link" to={`/workspaces/${id}/ai-insights`}><BrainCircuit size={18} /> AI Insights</Link><Link className="button-link" to={`/workspaces/${id}/ask-loop`}><Bot size={18} /> Ask LOOP</Link><Link className="button-link" to={`/workspaces/${id}/voc-report`}><FileText size={18} /> VoC Report</Link><Link className="button-link" to={`/workspaces/${id}/feedback`}><Users size={18} /> View Feedback</Link>{workspace.role !== 'Viewer' && <Link className="button-link" to={`/workspaces/${id}/feedback/new`}><MessageSquarePlus size={18} /> Create Feedback</Link>}{workspace.role !== 'Viewer' && <Link className="button-link" to={`/workspaces/${id}/feedback/import`}><FileUp size={18} /> Import CSV</Link>}{workspace.role !== 'Viewer' && <button className="button-link" type="button" onClick={() => { setSampleImportError(''); setShowSampleImportModal(true); }}><FileUp size={18} /> Import Sample Channel</button>}</div>
      <section className="members-section"><div className="section-heading"><div><h2>Members</h2><p>{workspace.memberCount} {workspace.memberCount === 1 ? 'person' : 'people'} in this workspace</p></div><Users size={22} /></div>
        <div className="member-list">{members.map((member) => <article className="member-row" key={member.id}><div className="member-avatar">{member.user.fullName.charAt(0).toUpperCase()}</div><div><strong>{member.user.fullName}</strong><span>{member.user.email}</span></div>{workspace.role === 'Admin' ? <select className="member-role-select" value={member.role} onChange={(event) => handleRoleChange(member.id, event.target.value)}><option>Admin</option><option>Analyst</option><option>Viewer</option></select> : <span className={`role-badge role-${member.role.toLowerCase()}`}>{member.role}</span>}</article>)}</div>
      </section>
      {workspace.role === 'Admin' && <section className="add-member-card"><div className="section-heading"><div><h2>Add a member</h2><p>Enter the email address of an already registered user.</p></div><UserPlus size={22} /></div><form className="add-member-form" onSubmit={handleAddMember}><input type="email" value={memberForm.email} onChange={(event) => setMemberForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" aria-label="Member email" autoComplete="email" /><select value={memberForm.role} onChange={(event) => setMemberForm((current) => ({ ...current, role: event.target.value }))}><option>Admin</option><option>Analyst</option><option>Viewer</option></select><button type="submit" disabled={isAddingMember}>{isAddingMember ? 'Adding...' : 'Add member'}</button></form>{memberError && <p className="form-error" role="alert">{memberError}</p>}</section>}
      {showSampleImportModal && <div className="dialog-backdrop" role="presentation"><section className="confirm-dialog channel-import-modal" role="dialog" aria-modal="true" aria-labelledby="channel-import-title"><h2 id="channel-import-title">Import Sample Channel</h2><p>Select a channel to generate realistic sample feedback. Each channel can be imported once per workspace.</p><div className="channel-options">{sampleChannels.map((channel) => <button className={`${selectedChannel === channel.value ? 'channel-option is-selected' : 'channel-option'}${channel.value === 'Website' ? ' channel-option--website' : ''}`} type="button" key={channel.value} onClick={() => setSelectedChannel(channel.value)} disabled={isImportingChannel}>{channel.label}</button>)}</div>{sampleImportError && <p className="form-error" role="alert">{sampleImportError}</p>}<div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setShowSampleImportModal(false)} disabled={isImportingChannel}>Cancel</button><button className="button-link" type="button" onClick={handleSampleChannelImport} disabled={isImportingChannel}>{isImportingChannel ? 'Importing...' : 'Import'}</button></div></section></div>}
    </section></main>
  );
}

export default WorkspaceDetailsPage;
