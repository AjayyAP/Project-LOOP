import Feedback from '../models/Feedback.js';
import WorkspaceMember from '../models/WorkspaceMember.js';

const statuses = ['NEW', 'REVIEWED', 'ACTIONED'];
const sentiments = ['Positive', 'Neutral', 'Negative'];

function countMap(keys, values) {
  const result = Object.fromEntries(keys.map((key) => [key, 0]));
  values.forEach(({ _id, count }) => { result[_id] = count; });
  return result;
}

function getDateMatch({ dateRange, startDate, endDate }) {
  if (dateRange === 'Today') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return { $gte: today };
  }
  if (dateRange === 'Last 7 Days') return { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
  if (dateRange === 'Last 30 Days') return { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
  if (dateRange === 'Custom Range') {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return { $gte: new Date(startDate), $lte: end };
  }
  return null;
}

export async function getWorkspaceDashboard(request, response, next) {
  try {
    const { channel, status, theme, sentiment, dateRange, startDate, endDate } = request.query;
    const match = { workspace: request.dashboardWorkspace._id };
    if (channel) match.channel = channel;
    if (status) match.status = status;
    if (theme) match.theme = theme;
    if (sentiment) match.sentiment = sentiment;

    const createdAt = getDateMatch({ dateRange, startDate, endDate });
    if (createdAt) match.createdAt = createdAt;

    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [analytics, recentFeedback, totalWorkspaceMembers, availableThemes] = await Promise.all([
      Feedback.aggregate([
        { $match: match },
        {
          $facet: {
            statistics: [{
              $group: {
                _id: null,
                totalFeedback: { $sum: 1 },
                negativeFeedback: { $sum: { $cond: [{ $eq: ['$sentiment', 'Negative'] }, 1, 0] } },
                newThisWeek: { $sum: { $cond: [{ $gte: ['$createdAt', weekStart] }, 1, 0] } },
              },
            }],
            status: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
            sentiment: [{ $group: { _id: '$sentiment', count: { $sum: 1 } } }],
            themes: [{ $match: { theme: { $type: 'string', $ne: '' } } }, { $group: { _id: '$theme', count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }, { $limit: 10 }],
            volume: [{ $group: { _id: { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }],
          },
        },
      ]),
      Feedback.find(match).populate('createdBy', 'fullName').sort({ createdAt: -1 }).limit(5).lean(),
      WorkspaceMember.countDocuments({ workspace: request.dashboardWorkspace._id }),
      Feedback.distinct('theme', { workspace: request.dashboardWorkspace._id, theme: { $type: 'string', $ne: '' } }),
    ]);

    const data = analytics[0];
    const summary = data.statistics[0] || { totalFeedback: 0, negativeFeedback: 0, newThisWeek: 0 };
    const statusCounts = countMap(statuses, data.status);
    const sentimentCounts = countMap(sentiments, data.sentiment.filter((item) => item._id));

    return response.status(200).json({
      success: true,
      data: {
        workspace: { id: request.dashboardWorkspace._id, name: request.dashboardWorkspace.name },
        statistics: {
          totalFeedback: summary.totalFeedback,
          negativeFeedbackPercentage: summary.totalFeedback ? Math.round((summary.negativeFeedback / summary.totalFeedback) * 100) : 0,
          newThisWeek: summary.newThisWeek,
          newFeedback: statusCounts.NEW,
          reviewedFeedback: statusCounts.REVIEWED,
          actionedFeedback: statusCounts.ACTIONED,
          totalWorkspaceMembers,
        },
        feedbackVolume: data.volume.map((item) => ({ date: item._id, count: item.count })),
        sentimentBreakdown: sentimentCounts,
        topThemes: data.themes.map((item) => ({ theme: item._id, count: item.count })),
        availableThemes: availableThemes.sort(),
        recentFeedback: recentFeedback.map((feedback) => ({
          id: feedback._id,
          title: feedback.title,
          priority: feedback.priority,
          status: feedback.status,
          createdBy: feedback.createdBy ? { id: feedback.createdBy._id, fullName: feedback.createdBy.fullName } : null,
          createdAt: feedback.createdAt,
        })),
      },
    });
  } catch (error) {
    return next(error);
  }
}
