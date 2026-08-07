import { AlertTriangle, ArrowLeft, BarChart3, CalendarPlus, ClipboardList, Clock3, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchWorkspaceDashboard } from '../services/dashboardService';

const initialFilters = { channel: '', status: '', theme: '', sentiment: '', dateRange: 'Last 30 Days', startDate: '', endDate: '' };

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

function ChartCard({ title, items, className }) {
  const maximum = Math.max(...items.map((item) => item.count), 1);
  return <section className="analytics-card"><h2>{title}</h2>{items.length === 0 ? <p className="recent-empty">No data available.</p> : <div className="bar-chart">{items.map(({ label, count }) => <div className="bar-row" key={label}><div><span>{label}</span><strong>{count}</strong></div><div className="bar-track"><span className={className} style={{ width: `${(count / maximum) * 100}%` }} /></div></div>)}</div>}</section>;
}

function DashboardLoading() {
  return <main className="workspace-page"><section className="workspace-container"><div className="dashboard-skeleton heading-skeleton" /><section className="stat-grid">{Array.from({ length: 6 }, (_, index) => <div className="dashboard-skeleton stat-skeleton" key={index} />)}</section><section className="analytics-grid">{Array.from({ length: 3 }, (_, index) => <div className="dashboard-skeleton chart-skeleton" key={index} />)}</section></section></main>;
}

function WorkspaceDashboardPage() {
  const { workspaceId } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      setError('');
      if (filters.dateRange === 'Custom Range' && (!filters.startDate || !filters.endDate)) {
        setIsLoading(false);
        setError('Select both dates for a custom range.');
        return;
      }
      try {
        const query = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''));
        setDashboard(await fetchWorkspaceDashboard(workspaceId, query));
      } catch (requestError) {
        setDashboard(null);
        setError(requestError.response?.data?.message || 'Unable to load workspace analytics.');
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, [workspaceId, filters]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  if (isLoading && !dashboard) return <DashboardLoading />;
  if (!dashboard) return <main className="workspace-page"><section className="form-page-card"><p className="form-error" role="alert">{error}</p><Link className="back-link" to={`/workspaces/${workspaceId}`}><ArrowLeft size={17} /> Workspace details</Link></section></main>;

  const { statistics, feedbackVolume, sentimentBreakdown, topThemes, availableThemes, recentFeedback } = dashboard;
  const cards = [
    ['Total Feedback', statistics.totalFeedback, ClipboardList, 'card-total'],
    ['Negative Feedback', `${statistics.negativeFeedbackPercentage}%`, AlertTriangle, 'card-negative'],
    ['New This Week', statistics.newThisWeek, CalendarPlus, 'card-new'],
    ['NEW', statistics.newFeedback, Clock3, 'card-new'],
    ['REVIEWED', statistics.reviewedFeedback, BarChart3, 'card-reviewed'],
    ['ACTIONED', statistics.actionedFeedback, ClipboardList, 'card-actioned'],
  ];
  const volumeItems = feedbackVolume.map((item) => ({ label: formatDate(item.date), count: item.count }));
  const sentimentItems = Object.entries(sentimentBreakdown).map(([label, count]) => ({ label, count }));
  const themeItems = topThemes.map((item) => ({ label: item.theme, count: item.count }));

  return <main className="workspace-page"><section className="workspace-container"><Link className="back-link" to={`/workspaces/${workspaceId}`}><ArrowLeft size={17} /> Workspace details</Link><header className="page-header"><div><p className="eyebrow">Workspace analytics</p><h1>{dashboard.workspace.name}</h1><p>Feedback trends and customer signals for the selected filters.</p></div><Link className="button-link" to={`/workspaces/${workspaceId}/feedback`}>View Feedback</Link></header><section className="dashboard-filters"><div className="filter-label"><Filter size={17} /> Analytics filters</div><select name="channel" value={filters.channel} onChange={updateFilter}><option value="">All channels</option><option>Manual</option><option>Email</option><option>Website</option><option>Play Store</option><option>App Store</option><option>Slack</option><option>Twitter/X</option></select><select name="status" value={filters.status} onChange={updateFilter}><option value="">All statuses</option><option>NEW</option><option>REVIEWED</option><option>ACTIONED</option></select><select name="theme" value={filters.theme} onChange={updateFilter}><option value="">All themes</option>{availableThemes.map((theme) => <option key={theme}>{theme}</option>)}</select><select name="sentiment" value={filters.sentiment} onChange={updateFilter}><option value="">All sentiments</option><option>Positive</option><option>Neutral</option><option>Negative</option></select><select name="dateRange" value={filters.dateRange} onChange={updateFilter}><option>Today</option><option>Last 7 Days</option><option>Last 30 Days</option><option>Custom Range</option></select>{filters.dateRange === 'Custom Range' && <div className="date-range-inputs"><label>From<input type="date" name="startDate" value={filters.startDate} onChange={updateFilter} /></label><label>To<input type="date" name="endDate" value={filters.endDate} onChange={updateFilter} /></label></div>}</section>{isLoading && <p className="page-status">Updating analytics...</p>}{error && <p className="form-error" role="alert">{error}</p>}{statistics.totalFeedback === 0 ? <section className="empty-state"><BarChart3 size={36} /><h2>No analytics available for the selected filters.</h2><p>Adjust the filters or add feedback to this workspace.</p></section> : <><section className="stat-grid">{cards.map(([label, value, Icon, className]) => <article className={`stat-card ${className}`} key={label}><div><span>{label}</span><strong>{value}</strong></div><Icon size={24} /></article>)}</section><section className="analytics-grid analytics-grid-three"><ChartCard title="Feedback Volume Over Time" items={volumeItems} className="volume-bar" /><ChartCard title="Sentiment Breakdown" items={sentimentItems} className="sentiment-bar" /><ChartCard title="Top Themes" items={themeItems} className="theme-bar" /></section><section className="recent-feedback-card"><div className="section-heading"><div><h2>Recent Feedback</h2><p>Latest feedback matching the selected filters.</p></div><Clock3 size={22} /></div>{recentFeedback.length === 0 ? <p className="recent-empty">No feedback has been created yet.</p> : <div className="recent-list">{recentFeedback.map((feedback) => <Link to={`/feedback/${feedback.id}`} state={{ workspaceId }} key={feedback.id}><div><strong>{feedback.title}</strong><span>By {feedback.createdBy?.fullName || 'Unknown'} · {formatDate(feedback.createdAt)}</span></div><div><span className={`priority-badge priority-${feedback.priority.toLowerCase()}`}>{feedback.priority}</span><span className={`status-badge status-${feedback.status.toLowerCase()}`}>{feedback.status}</span></div></Link>)}</div>}</section></>}</section></main>;
}

export default WorkspaceDashboardPage;
