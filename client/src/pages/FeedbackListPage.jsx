import { ArrowLeft, ChevronLeft, ChevronRight, ClipboardList, Plus, RotateCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { fetchWorkspaceFeedback, updateFeedbackStatus } from '../services/feedbackService';

const initialFilters = { search: '', status: '', priority: '', category: '', channel: '', sentiment: '', theme: '', dateRange: '', startDate: '', endDate: '', sort: 'newest' };
const statusOptions = ['NEW', 'REVIEWED', 'ACTIONED'];

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

function FeedbackListPage() {
  const { workspaceId } = useParams();
  const location = useLocation();
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [availableThemes, setAvailableThemes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingId, setIsUpdatingId] = useState('');
  const [viewerRole, setViewerRole] = useState('');
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(() => ({ ...initialFilters, theme: new URLSearchParams(location.search).get('theme') || '' }));
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadFeedback() {
      setIsLoading(true);
      setError('');
      try {
        const query = Object.fromEntries(Object.entries({ ...filters, page, limit: 10 }).filter(([, value]) => value !== ''));
        const data = await fetchWorkspaceFeedback(workspaceId, query);
        setFeedbackItems(data.feedback);
        setAvailableThemes(data.availableThemes);
        setPagination(data.pagination);
        setViewerRole(data.viewerRole);
      } catch (requestError) {
        setError(requestError.response?.status === 403 ? 'Permission denied.' : requestError.response?.data?.message || 'Unable to load feedback.');
      } finally {
        setIsLoading(false);
      }
    }
    loadFeedback();
  }, [workspaceId, filters, page]);

  function setFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  }

  function clearFilters() {
    setFilters(initialFilters);
    setPage(1);
  }

  async function handleInlineStatusChange(feedbackId, status) {
    setIsUpdatingId(feedbackId);
    setError('');
    try {
      const data = await updateFeedbackStatus(feedbackId, status);
      setFeedbackItems((current) => current.map((feedback) => (feedback.id === feedbackId ? { ...feedback, status: data.data.feedback.status } : feedback)));
    } catch (requestError) {
      setError(requestError.response?.status === 403 ? 'Permission denied.' : requestError.response?.data?.message || 'Unable to update feedback status.');
    } finally {
      setIsUpdatingId('');
    }
  }

  const canUpdateStatus = ['Admin', 'Analyst'].includes(viewerRole);
  const canCreateFeedback = ['Admin', 'Analyst'].includes(viewerRole);

  return (
    <main className="workspace-page">
      <section className="workspace-container">
        <Link className="back-link" to={`/workspaces/${workspaceId}`}><ArrowLeft size={17} /> Workspace details</Link>
        <header className="page-header"><div><p className="eyebrow">Feedback</p><h1>Workspace Feedback</h1><p>Track ideas, improvements, and issues from your team.</p></div>{canCreateFeedback && <Link className="button-link" to={`/workspaces/${workspaceId}/feedback/new`}><Plus size={18} /> Create Feedback</Link>}</header>
        {location.state?.successMessage && <p className="form-success" role="status">{location.state.successMessage}</p>}

        <section className="inbox-filter-card">
          <div className="search-input"><Search size={18} /><input name="search" value={filters.search} onChange={setFilter} placeholder="Search by title" /></div>
          <select name="status" value={filters.status} onChange={setFilter}><option value="">All statuses</option>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select>
          <select name="priority" value={filters.priority} onChange={setFilter}><option value="">All priorities</option><option>Low</option><option>Medium</option><option>High</option></select>
          <select name="category" value={filters.category} onChange={setFilter}><option value="">All categories</option><option>Bug</option><option>Feature Request</option><option>Improvement</option><option>Other</option></select>
          <select name="channel" value={filters.channel} onChange={setFilter}><option value="">All channels</option><option>Email</option><option>Website</option><option>Play Store</option><option>App Store</option><option>Slack</option><option>Twitter/X</option></select>
          <select name="sentiment" value={filters.sentiment} onChange={setFilter}><option value="">All sentiments</option><option>Positive</option><option>Neutral</option><option>Negative</option></select>
          <select name="theme" value={filters.theme} onChange={setFilter}><option value="">All themes</option>{availableThemes.map((theme) => <option key={theme}>{theme}</option>)}</select>
          <select name="dateRange" value={filters.dateRange} onChange={setFilter}><option value="">All dates</option><option>Today</option><option>Last 7 Days</option><option>Last 30 Days</option><option>Custom Range</option></select>
          <select name="sort" value={filters.sort} onChange={setFilter}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="priority">Priority</option></select>
          <button className="filter-reset" type="button" onClick={clearFilters}><RotateCcw size={16} /> Clear Filters</button>
          {filters.dateRange === 'Custom Range' && <div className="date-range-inputs"><label>From<input type="date" name="startDate" value={filters.startDate} onChange={setFilter} /></label><label>To<input type="date" name="endDate" value={filters.endDate} onChange={setFilter} /></label></div>}
        </section>

        {isLoading && <p className="page-status">Loading feedback...</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {!isLoading && !error && pagination.totalItems === 0 && <section className="empty-state"><ClipboardList size={36} /><h2>No feedback found</h2><p>{canCreateFeedback ? 'Try clearing filters or create the first feedback item for this workspace.' : 'Try clearing filters to view feedback from this workspace.'}</p>{canCreateFeedback && <Link className="button-link" to={`/workspaces/${workspaceId}/feedback/new`}><Plus size={18} /> Create Feedback</Link>}</section>}

        <section className="feedback-list">
          {feedbackItems.map((feedback) => <article className="feedback-card" key={feedback.id}>
            <div className="feedback-card-header"><Link className="feedback-card-link" to={`/feedback/${feedback.id}`} state={{ workspaceId }}><h2>{feedback.title}</h2></Link>{canUpdateStatus ? <select className={`inline-status-select status-${feedback.status.toLowerCase()}`} aria-label={`Change status for ${feedback.title}`} value={feedback.status} onChange={(event) => handleInlineStatusChange(feedback.id, event.target.value)} disabled={isUpdatingId === feedback.id}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select> : <span className={`status-badge status-${feedback.status.toLowerCase()}`}>{feedback.status}</span>}</div>
            <Link className="feedback-card-link" to={`/feedback/${feedback.id}`} state={{ workspaceId }}><p>{feedback.description}</p></Link>
            <div className="feedback-meta"><span className="category-badge">{feedback.category}</span><span className={`priority-badge priority-${feedback.priority.toLowerCase()}`}>{feedback.priority}</span>{feedback.channel && feedback.channel !== 'Manual' && <span className="channel-badge">{feedback.channel}</span>}{feedback.sentiment && <span className={`sentiment-badge sentiment-${feedback.sentiment.toLowerCase()}`}>{feedback.sentiment}</span>}<span>By {feedback.createdBy?.fullName || 'Unknown'} · {formatDate(feedback.createdAt)}</span></div>
          </article>)}
        </section>
        {!isLoading && !error && pagination.totalItems > 0 && <nav className="pagination" aria-label="Feedback pagination"><button type="button" onClick={() => setPage((current) => current - 1)} disabled={pagination.page <= 1}><ChevronLeft size={17} /> Previous</button><span>Page {pagination.page} of {pagination.totalPages}</span><button type="button" onClick={() => setPage((current) => current + 1)} disabled={pagination.page >= pagination.totalPages}>Next <ChevronRight size={17} /></button></nav>}
      </section>
    </main>
  );
}

export default FeedbackListPage;
