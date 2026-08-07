import { ArrowLeft, ClipboardCopy, Download, FileText, History, Sparkles } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { fetchVocReport, generateVocReport } from '../services/vocReportService';

const sections = [['Executive Summary', 'executiveSummary'], ['Top Customer Themes', 'topCustomerThemes'], ['Customer Sentiment Overview', 'customerSentimentOverview'], ['Most Critical Issues', 'mostCriticalIssues'], ['Positive Customer Feedback', 'positiveCustomerFeedback'], ['Recommended Actions', 'recommendedActions'], ['Product Improvement Opportunities', 'productImprovementOpportunities'], ['Final Conclusion', 'finalConclusion']];
const initialFilters = { dateRange: 'Last 30 Days', startDate: '', endDate: '' };

function VocReportPage() {
  const { workspaceId } = useParams();
  const [searchParams] = useSearchParams();
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const reportId = searchParams.get('reportId');

  useEffect(() => { if (reportId) fetchVocReport(workspaceId, reportId).then((savedReport) => { setReport(savedReport); setMessage('Saved report loaded.'); }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load the saved report.')); }, [workspaceId, reportId]);

  async function handleGenerate() {
    if (filters.dateRange === 'Custom Range' && (!filters.startDate || !filters.endDate)) { setError('Select both dates for a custom range.'); return; }
    setIsGenerating(true); setError(''); setMessage(''); setCopyMessage('');
    try { const data = await generateVocReport(workspaceId, filters); setReport(data.report); setMessage(data.message || 'Voice of Customer report generated and saved successfully.'); } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to generate the Voice of Customer report.'); } finally { setIsGenerating(false); }
  }

  async function handleCopy() { try { await navigator.clipboard.writeText(sections.map(([title, key]) => `${title}\n${report[key]}`).join('\n\n')); setCopyMessage('Report copied to clipboard.'); } catch { setError('Unable to copy the report. Please copy it manually.'); } }

  function exportPdf() {
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' }); let y = 52; const width = 500;
    const add = (heading, body) => { const lines = pdf.splitTextToSize(body, width); if (y + lines.length * 14 > 780) { pdf.addPage(); y = 52; } pdf.setFont('helvetica', 'bold'); pdf.setFontSize(13); pdf.text(heading, 48, y); y += 20; pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10); pdf.text(lines, 48, y); y += lines.length * 14 + 18; };
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(20); pdf.text('Project LOOP - Voice of Customer Report', 48, y); y += 30; pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10); pdf.text(`Date range: ${report.dateRange?.label || filters.dateRange}`, 48, y); y += 22;
    sections.forEach(([title, key]) => add(title, report[key]));
    add('Sentiment Shift', `Positive ${report.sentimentShift.positive >= 0 ? 'up' : 'down'} ${Math.abs(report.sentimentShift.positive)}%; Neutral ${report.sentimentShift.neutral >= 0 ? 'up' : 'down'} ${Math.abs(report.sentimentShift.neutral)}%; Negative ${report.sentimentShift.negative >= 0 ? 'up' : 'down'} ${Math.abs(report.sentimentShift.negative)}%.`);
    add('Verbatim Customer Quotes', report.verbatimQuotes.map((quote) => `${quote.title}: "${quote.quote}"`).join('\n\n'));
    pdf.save('project-loop-voc-report.pdf');
  }

  return <main className="workspace-page"><section className="workspace-container voc-report-page"><Link className="back-link" to={`/workspaces/${workspaceId}`}><ArrowLeft size={17} /> Workspace details</Link><header className="page-header"><div><p className="eyebrow">AI Executive Insight</p><h1>Voice of Customer Report</h1><p>Generate an evidence-based executive summary from this workspace's feedback.</p></div><FileText size={30} className="insights-header-icon" /></header><section className="insights-date-filter"><label>Date range<select name="dateRange" value={filters.dateRange} onChange={(event) => setFilters((current) => ({ ...current, dateRange: event.target.value }))}><option>Today</option><option>Last 7 Days</option><option>Last 30 Days</option><option>Custom Range</option></select></label>{filters.dateRange === 'Custom Range' && <><label>From<input type="date" value={filters.startDate} onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))} /></label><label>To<input type="date" value={filters.endDate} onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))} /></label></>}</section><section className="voc-generate-card"><div><Sparkles size={21} /><p>LOOP analyzes workspace feedback to surface customer priorities and recommended actions.</p></div><div><Link className="secondary-link" to={`/workspaces/${workspaceId}/voc-report/history`}><History size={17} /> Report History</Link><button type="button" onClick={handleGenerate} disabled={isGenerating}>{isGenerating ? 'Generating report...' : 'Generate Report'}</button></div></section>{error && <p className="form-error" role="alert">{error}</p>}{message && <p className={report ? 'form-success' : 'report-message'} role="status">{message}</p>}{!report && !message && !error && <section className="empty-state voc-empty"><FileText size={36} /><h2>No report generated yet</h2><p>Generate a report once the workspace has enough feedback.</p></section>}{report && <><div className="report-actions"><button type="button" onClick={handleCopy}><ClipboardCopy size={17} /> Copy Report</button><button type="button" onClick={exportPdf}><Download size={17} /> Export PDF</button>{copyMessage && <span className="form-success">{copyMessage}</span>}</div><section className="voc-report-grid">{sections.map(([title, key]) => <article className="voc-section-card" key={key}><h2>{title}</h2><p>{report[key]}</p></article>)}</section><section className="voc-extra-grid"><article className="voc-section-card"><h2>Sentiment Shift</h2>{Object.entries(report.sentimentShift).map(([sentiment, value]) => <p key={sentiment}>{sentiment[0].toUpperCase() + sentiment.slice(1)} Feedback {value >= 0 ? '↑' : '↓'} {Math.abs(value)}%</p>)}</article><article className="voc-section-card"><h2>Verbatim Customer Quotes</h2>{report.verbatimQuotes.map((quote) => <blockquote key={quote.feedback}><strong>{quote.title}</strong><p>“{quote.quote}”</p></blockquote>)}</article></section></>}</section></main>;
}

export default VocReportPage;
