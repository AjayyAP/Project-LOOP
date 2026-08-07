import { ArrowLeft, Bot, CalendarDays, Pencil, RefreshCw, Trash2, UserPlus, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { assignFeedback, deleteFeedback, fetchFeedback, reclassifyFeedback, updateFeedbackStatus } from '../services/feedbackService';
import { fetchWorkspaceMembers } from '../services/workspaceService';

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value));
}

function FeedbackDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.successMessage || '');
  const [isWorking, setIsWorking] = useState(false);
  const [isReclassifying, setIsReclassifying] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    async function loadFeedback() {
      try {
        const nextFeedback = await fetchFeedback(id);
        setFeedback(nextFeedback);
        const workspaceId = nextFeedback.workspace?.id || nextFeedback.workspace;
        if (nextFeedback.viewerRole === 'Admin') setMembers(await fetchWorkspaceMembers(workspaceId));
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load feedback.');
      }
    }
    loadFeedback();
  }, [id]);

  async function changeStatus(event) {
    setIsWorking(true);
    setError('');
    try {
      const data = await updateFeedbackStatus(id, event.target.value);
      setFeedback((current) => ({ ...data.data.feedback, viewerRole: current.viewerRole }));
      setNotice(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update the status.');
    } finally {
      setIsWorking(false);
    }
  }

  async function handleReclassify() {
    setIsReclassifying(true);
    setError('');
    try {
      const data = await reclassifyFeedback(id);
      setFeedback((current) => ({ ...current, ...data.data.aiAnalysis }));
      setNotice(data.message);
    } catch (requestError) {
      setError(
        requestError.response?.status === 403
          ? 'Permission denied.'
          : requestError.response?.data?.message || 'AI re-classification is temporarily unavailable.',
      );
    } finally {
      setIsReclassifying(false);
    }
  }

  async function handleAssign(event) {
    event.preventDefault();
    if (!assignedTo) {
      setError('Select a workspace member to assign.');
      return;
    }
    setIsWorking(true);
    setError('');
    try {
      const data = await assignFeedback(id, assignedTo);
      setFeedback((current) => ({ ...data.data.feedback, viewerRole: current.viewerRole }));
      setNotice(data.message);
      setAssignedTo('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to assign feedback.');
    } finally {
      setIsWorking(false);
    }
  }

  async function handleDelete() {
    setIsWorking(true);
    setError('');
    try {
      await deleteFeedback(id);
      const workspaceId = feedback.workspace?.id || feedback.workspace;
      navigate(`/workspaces/${workspaceId}/feedback`, { replace: true, state: { successMessage: 'Feedback deleted successfully.' } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete feedback.');
      setShowDeleteDialog(false);
    } finally {
      setIsWorking(false);
    }
  }

  if (!feedback && !error) return <main className="workspace-page"><p className="page-status">Loading feedback...</p></main>;
  if (!feedback) return <main className="workspace-page"><section className="form-page-card"><p className="form-error" role="alert">{error}</p></section></main>;

  const workspaceId = location.state?.workspaceId || feedback.workspace?.id || feedback.workspace;
  const canEdit = ['Admin', 'Analyst'].includes(feedback.viewerRole);
  const canDelete = feedback.viewerRole === 'Admin';
  const canChangeStatus = ['Admin', 'Analyst'].includes(feedback.viewerRole);
  const isAdmin = feedback.viewerRole === 'Admin';

  return (
    <main className="workspace-page">
      <section className="workspace-container">
        <Link className="back-link" to={`/workspaces/${workspaceId}/feedback`}><ArrowLeft size={17} /> Feedback list</Link>
        {notice && <p className="form-success" role="status">{notice}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}

        <article className="feedback-details-card">
          <header>
            <div className="card-icon"><UserRound size={24} /></div>
            <div><p className="eyebrow">{feedback.category}</p><h1>{feedback.title}</h1></div>
            <span className={`status-badge status-${feedback.status.toLowerCase().replace(' ', '-')}`}>{feedback.status}</span>
          </header>

          <div className="feedback-actions">
            {canChangeStatus && <label>Status<select value={feedback.status} onChange={changeStatus} disabled={isWorking}><option>NEW</option><option>REVIEWED</option><option>ACTIONED</option></select></label>}
            {canEdit && <Link className="secondary-link" to={`/feedback/${id}/edit`} state={{ workspaceId }}><Pencil size={16} /> Edit</Link>}
            {canDelete && <button className="danger-button" type="button" onClick={() => setShowDeleteDialog(true)} disabled={isWorking}><Trash2 size={16} /> Delete</button>}
          </div>

          <div className="feedback-badges"><span className={`priority-badge priority-${feedback.priority.toLowerCase()}`}>{feedback.priority} priority</span><span className="category-badge">{feedback.category}</span></div>
          <section><h2>Description</h2><p className="feedback-description">{feedback.description}</p></section>

          <section className="ai-analysis">
            <div className="section-heading">
              <div><h2>AI Analysis</h2><p>Automatic classification generated from this feedback.</p></div>
              {canEdit && <button className="secondary-link reclassify-button" type="button" onClick={handleReclassify} disabled={isReclassifying}><RefreshCw size={16} className={isReclassifying ? 'is-spinning' : ''} /> {isReclassifying ? 'Re-classifying...' : 'Re-classify AI'}</button>}
              {!canEdit && <Bot size={22} />}
            </div>
            <div className="ai-analysis-grid"><div><strong>Sentiment</strong><span>{feedback.sentiment || 'Not available'}</span></div><div><strong>Score</strong><span>{typeof feedback.sentimentScore === 'number' ? feedback.sentimentScore.toFixed(2) : 'Not available'}</span></div><div><strong>Theme</strong><span>{feedback.theme || 'Not available'}</span></div><div><strong>Feature Area</strong><span>{feedback.featureArea || 'Not available'}</span></div></div>
            <div className="ai-summary"><strong>Summary</strong><p>{feedback.aiSummary || 'AI analysis was unavailable when this feedback was created.'}</p></div>
          </section>

          <section className="feedback-info-grid"><div><UserRound size={18} /><span><strong>Created by</strong>{feedback.createdBy?.fullName || 'Unknown'}<small>{feedback.createdBy?.email}</small></span></div><div><CalendarDays size={18} /><span><strong>Created</strong>{formatDate(feedback.createdAt)}</span></div><div><UserRound size={18} /><span><strong>Assigned to</strong>{feedback.assignedTo?.fullName || 'Unassigned'}{feedback.assignedTo?.email && <small>{feedback.assignedTo.email}</small>}</span></div></section>

          {isAdmin && <section className="assignment-section"><div><h2>Assign feedback</h2><p>Choose a workspace member to own this feedback.</p></div><form onSubmit={handleAssign} className="assignment-form"><select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)}><option value="">Select a member</option>{members.map((member) => <option value={member.user.id} key={member.id}>{member.user.fullName} ({member.role})</option>)}</select><button type="submit" disabled={isWorking}><UserPlus size={16} /> Assign</button></form></section>}
        </article>

        {showDeleteDialog && <div className="dialog-backdrop" role="presentation"><section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title"><h2 id="delete-title">Delete feedback?</h2><p>This action cannot be undone.</p><div><button className="secondary-button" type="button" onClick={() => setShowDeleteDialog(false)} disabled={isWorking}>Cancel</button><button className="danger-button" type="button" onClick={handleDelete} disabled={isWorking}>{isWorking ? 'Deleting...' : 'Delete feedback'}</button></div></section></div>}
      </section>
    </main>
  );
}

export default FeedbackDetailsPage;
