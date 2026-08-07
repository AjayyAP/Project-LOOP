import Feedback from '../models/Feedback.js';
import VoCReport from '../models/VoCReport.js';
import { generateVocReport } from '../services/vocReportService.js';

const minimumFeedbackForReport = 3;
const sentiments = ['Positive', 'Neutral', 'Negative'];

function getPeriod({ dateRange = 'Last 30 Days', startDate, endDate }) {
  const now = new Date();
  let start;
  let end = now;
  if (dateRange === 'Today') { start = new Date(now); start.setHours(0, 0, 0, 0); }
  else if (dateRange === 'Last 7 Days') start = new Date(now.getTime() - 7 * 86400000);
  else if (dateRange === 'Custom Range') { start = new Date(startDate); end = new Date(endDate); end.setHours(23, 59, 59, 999); }
  else start = new Date(now.getTime() - 30 * 86400000);
  const duration = end.getTime() - start.getTime() + 1;
  return { label: dateRange, current: { $gte: start, $lte: end }, previous: { $gte: new Date(start.getTime() - duration), $lt: start }, start, end };
}

function distribution(items) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const counts = Object.fromEntries(items.map((item) => [item._id, item.count]));
  return Object.fromEntries(sentiments.map((sentiment) => [sentiment, total ? (counts[sentiment] || 0) / total * 100 : 0]));
}

function serializeReport(report) {
  return {
    id: report._id,
    dateRange: report.dateRange,
    generatedAt: report.generatedAt,
    generatedBy: report.generatedBy?.fullName ? { id: report.generatedBy._id, fullName: report.generatedBy.fullName } : null,
    executiveSummary: report.executiveSummary,
    topCustomerThemes: report.topThemes,
    customerSentimentOverview: report.sentimentOverview,
    mostCriticalIssues: report.criticalIssues,
    positiveCustomerFeedback: report.positiveFeedback,
    recommendedActions: report.recommendations,
    productImprovementOpportunities: report.productImprovementOpportunities,
    finalConclusion: report.finalConclusion,
    verbatimQuotes: report.verbatimQuotes,
    sentimentShift: report.sentimentShift,
  };
}

export async function createVocReport(request, response, next) {
  try {
    const period = getPeriod(request.body);
    const workspace = request.vocReportWorkspace._id;
    const [feedback, currentSentiments, previousSentiments] = await Promise.all([
      Feedback.find({ workspace, createdAt: period.current }).select('title description sentiment theme featureArea priority status aiSummary').lean(),
      Feedback.aggregate([{ $match: { workspace, createdAt: period.current, sentiment: { $in: sentiments } } }, { $group: { _id: '$sentiment', count: { $sum: 1 } } }]),
      Feedback.aggregate([{ $match: { workspace, createdAt: period.previous, sentiment: { $in: sentiments } } }, { $group: { _id: '$sentiment', count: { $sum: 1 } } }]),
    ]);

    if (feedback.length < minimumFeedbackForReport) return response.status(200).json({ success: true, data: { report: null, message: 'More feedback is needed before a meaningful Voice of Customer report can be generated.' } });
    const generated = await generateVocReport(feedback);
    if (!generated) return response.status(200).json({ success: true, data: { report: null, message: 'The Voice of Customer report could not be generated right now. Please try again.' } });

    const current = distribution(currentSentiments);
    const previous = distribution(previousSentiments);
    const report = await VoCReport.create({
      workspace,
      generatedBy: request.user._id,
      dateRange: { label: period.label, startDate: period.start, endDate: period.end },
      generatedAt: new Date(),
      executiveSummary: generated.executiveSummary,
      topThemes: generated.topCustomerThemes,
      sentimentOverview: generated.customerSentimentOverview,
      criticalIssues: generated.mostCriticalIssues,
      positiveFeedback: generated.positiveCustomerFeedback,
      recommendations: generated.recommendedActions,
      productImprovementOpportunities: generated.productImprovementOpportunities,
      finalConclusion: generated.finalConclusion,
      verbatimQuotes: feedback.slice(0, 5).map((item) => ({ feedback: item._id, title: item.title, quote: item.description })),
      sentimentShift: { positive: Number((current.Positive - previous.Positive).toFixed(1)), neutral: Number((current.Neutral - previous.Neutral).toFixed(1)), negative: Number((current.Negative - previous.Negative).toFixed(1)) },
    });
    await report.populate('generatedBy', 'fullName');
    return response.status(200).json({ success: true, data: { report: serializeReport(report), message: null } });
  } catch (error) { return next(error); }
}

export async function getVocReports(request, response, next) {
  try {
    const reports = await VoCReport.find({ workspace: request.vocReportWorkspace._id }).populate('generatedBy', 'fullName').sort({ generatedAt: -1 }).select('dateRange generatedAt generatedBy').lean();
    return response.status(200).json({ success: true, data: { reports: reports.map(serializeReport) } });
  } catch (error) { return next(error); }
}

export async function getVocReport(request, response, next) {
  try {
    const report = await VoCReport.findOne({ _id: request.params.reportId, workspace: request.vocReportWorkspace._id }).populate('generatedBy', 'fullName').lean();
    if (!report) return response.status(404).json({ success: false, message: 'Voice of Customer report not found.' });
    return response.status(200).json({ success: true, data: { report: serializeReport(report) } });
  } catch (error) { return next(error); }
}
