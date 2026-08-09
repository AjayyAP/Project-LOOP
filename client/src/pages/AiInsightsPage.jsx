import { ArrowLeft, BrainCircuit, Lightbulb, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchThemeTrends } from '../services/aiInsightsService';

const initialFilters = { dateRange: 'Last 30 Days', startDate: '', endDate: '' };

function FrequencyBars({ items, getLabel }) {
  const maximum = Math.max(...items.map((item) => item.count), 1);
  if (!items.length) return <p className="recent-empty">No data available.</p>;
  return <div className="insight-bars">{items.map((item) => <div className="insight-bar-row" key={getLabel(item)}><div><span>{getLabel(item)}</span><strong>{item.count}</strong></div><div><span style={{ width: `${(item.count / maximum) * 100}%` }} /></div></div>)}</div>;
}

function AiInsightsPage() {
  const { workspaceId } = useParams();
  const [insights, setInsights] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadInsights() {
      setIsLoading(true);
      setError('');
      if (filters.dateRange === 'Custom Range' && (!filters.startDate || !filters.endDate)) {
        setIsLoading(false);
        return;
      }

      try {
        const query = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''));
        setInsights(await fetchThemeTrends(workspaceId, query));
      } catch (requestError) {
        setInsights(null);
        setError(requestError.response?.data?.message || 'Unable to load AI insights.');
      } finally {
        setIsLoading(false);
      }
    }
    loadInsights();
  }, [workspaceId, filters]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function updateCustomRange(event) {
    const { name, value } = event.target;
    setCustomRange((current) => ({ ...current, [name]: value }));
  }

  function applyCustomRange() {
    const { startDate, endDate } = customRange;
    if (!startDate || !endDate) {
      setError('Select both dates for a custom range.');
      return;
    }
    if (startDate > endDate) {
      setError('Start date cannot be after end date.');
      return;
    }
    setError('');
    setFilters({ dateRange: 'Custom Range', startDate, endDate });
  }

  if (!insights && isLoading) return <main className="workspace-page"><p className="page-status">Loading AI insights...</p></main>;
  if (!insights) return <main className="workspace-page"><section className="form-page-card"><p className="form-error" role="alert">{error}</p><Link className="back-link" to={`/workspaces/${workspaceId}`}><ArrowLeft size={17} /> Workspace details</Link></section></main>;

  const hasInsights = insights.classifiedFeedback > 0;
  const volumeItems = insights.themeVolume.map((item) => ({ ...item, label: `${item.date} · ${item.theme}` }));

  return (
    <main className="workspace-page">
      <section className="workspace-container">
        <Link className="back-link" to={`/workspaces/${workspaceId}`}><ArrowLeft size={17} /> Workspace details</Link>
        <header className="page-header"><div><p className="eyebrow">AI Insights</p><h1>{insights.workspace.name}</h1><p>Theme trends inferred from automatically classified feedback.</p></div><BrainCircuit size={30} className="insights-header-icon" /></header>

        <section className="insights-date-filter">
          <label>Date range<select name="dateRange" value={filters.dateRange} onChange={updateFilter}><option>Today</option><option>Last 7 Days</option><option>Last 30 Days</option><option>Custom Range</option></select></label>
          {filters.dateRange === 'Custom Range' && <><label>From<input type="date" name="startDate" value={customRange.startDate} onChange={updateCustomRange} /></label><label>To<input type="date" name="endDate" value={customRange.endDate} onChange={updateCustomRange} /></label><button className="secondary-link" type="button" onClick={applyCustomRange}>Apply range</button></>}
        </section>

        {isLoading && <p className="page-status">Updating theme trends...</p>}
        {error && <p className="form-error" role="alert">{error}</p>}

        {!hasInsights ? <section className="empty-state"><Sparkles size={36} /><h2>No theme trends available.</h2><p>Create new feedback while Gemini is configured to generate theme trends and sentiment insights.</p></section> : <>
          <section className="insight-summary-grid"><article><Lightbulb size={22} /><span>Most common theme</span><strong>{insights.mostCommonTheme}</strong></article><article><BrainCircuit size={22} /><span>Unique themes</span><strong>{insights.themeCounts.length}</strong></article><article><Sparkles size={22} /><span>Classified feedback</span><strong>{insights.classifiedFeedback} / {insights.totalFeedback}</strong></article></section>

          <section className="insight-section"><h2>Theme Volume Over Time</h2><FrequencyBars items={volumeItems} getLabel={(item) => item.label} /></section>

          <section className="insight-section">
            <div className="section-heading"><div><h2>Theme Trends</h2><p>Compare the selected period with the preceding equivalent period.</p></div><TrendingUp size={22} /></div>
            {insights.themeTrends.length === 0 ? <p className="recent-empty">No theme trends available.</p> : <div className="theme-trends-table"><div><strong>Theme</strong><strong>Current</strong><strong>Previous</strong><strong>Growth</strong><strong>Trend</strong></div>{insights.themeTrends.map((theme) => <Link key={theme.theme} to={`/workspaces/${workspaceId}/feedback?theme=${encodeURIComponent(theme.theme)}`} title={`View ${theme.theme} feedback`}><span>{theme.theme}</span><span>{theme.currentCount}</span><span>{theme.previousCount}</span><span>{theme.percentageChange === null ? '—' : `${theme.percentageChange}%`}</span><span className={`trend-badge trend-${theme.trend.toLowerCase().replace(' ', '-')}`}>{theme.trend}</span></Link>)}</div>}
          </section>

          <section className="insight-content-grid"><section className="insight-section"><h2>Sentiment Overview</h2><div className="sentiment-grid">{Object.entries(insights.sentimentDistribution).map(([sentiment, count]) => <article className={`sentiment-card sentiment-${sentiment.toLowerCase()}`} key={sentiment}><span>{sentiment}</span><strong>{count}</strong></article>)}</div></section><section className="insight-section"><h2>Feature Area Distribution</h2><FrequencyBars items={insights.featureAreaDistribution} getLabel={(item) => item.featureArea} /></section></section>

          <section className="insight-section"><h2>Top Themes</h2><div className="top-themes-table"><div><strong>Theme</strong><strong>Count</strong><strong>Percentage</strong></div>{insights.topThemes.map((theme) => <Link key={theme.theme} to={`/workspaces/${workspaceId}/feedback?theme=${encodeURIComponent(theme.theme)}`}><span>{theme.theme}</span><span>{theme.count}</span><span>{theme.percentage}%</span></Link>)}</div></section>
        </>}
      </section>
    </main>
  );
}

export default AiInsightsPage;
