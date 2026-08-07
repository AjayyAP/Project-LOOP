import Feedback from '../models/Feedback.js';

const sentiments = ['Positive', 'Neutral', 'Negative'];

function toCountMap(items) {
  return Object.fromEntries(items.map((item) => [item._id, item.count]));
}

function getPeriod({ dateRange = 'Last 30 Days', startDate, endDate }) {
  const now = new Date();
  let start;
  let end = now;

  if (dateRange === 'Today') {
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
  } else if (dateRange === 'Last 7 Days') {
    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (dateRange === 'Custom Range') {
    start = new Date(startDate);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  } else {
    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const duration = end.getTime() - start.getTime() + 1;
  return {
    current: { $gte: start, $lte: end },
    previous: { $gte: new Date(start.getTime() - duration), $lt: start },
  };
}

function trendFor(currentCount, previousCount) {
  if (previousCount === 0 && currentCount > 0) return { percentageChange: null, trend: 'New Theme' };
  const percentageChange = previousCount ? Number((((currentCount - previousCount) / previousCount) * 100).toFixed(1)) : 0;
  if (percentageChange >= 100) return { percentageChange, trend: 'Spike' };
  if (percentageChange >= 50) return { percentageChange, trend: 'Trending' };
  return { percentageChange, trend: 'Stable' };
}

export async function getThemeTrends(request, response, next) {
  try {
    const workspaceId = request.aiInsightsWorkspace._id;
    const periods = getPeriod(request.query);
    const themeMatch = { workspace: workspaceId, theme: { $type: 'string', $ne: '' } };
    const [currentResults, previousThemeCounts, totalFeedback] = await Promise.all([
      Feedback.aggregate([
        { $match: { ...themeMatch, createdAt: periods.current } },
        {
          $facet: {
            total: [{ $count: 'count' }],
            themes: [{ $group: { _id: '$theme', count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }],
            featureAreas: [{ $match: { featureArea: { $type: 'string', $ne: '' } } }, { $group: { _id: '$featureArea', count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }],
            sentiments: [{ $match: { sentiment: { $in: sentiments } } }, { $group: { _id: '$sentiment', count: { $sum: 1 } } }],
            volume: [{ $group: { _id: { date: { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } }, theme: '$theme' }, count: { $sum: 1 } } }, { $sort: { '_id.date': 1, '_id.theme': 1 } }],
          },
        },
      ]),
      Feedback.aggregate([{ $match: { ...themeMatch, createdAt: periods.previous } }, { $group: { _id: '$theme', count: { $sum: 1 } } }]),
      Feedback.countDocuments({ workspace: workspaceId, createdAt: periods.current }),
    ]);

    const [trends] = currentResults;
    const previousMap = toCountMap(previousThemeCounts);
    const currentMap = toCountMap(trends.themes);
    const themeTrends = [...new Set([...Object.keys(currentMap), ...Object.keys(previousMap)])]
      .map((theme) => ({ theme, currentCount: currentMap[theme] || 0, previousCount: previousMap[theme] || 0, ...trendFor(currentMap[theme] || 0, previousMap[theme] || 0) }))
      .sort((first, second) => second.currentCount - first.currentCount || first.theme.localeCompare(second.theme));
    const sentimentMap = { Positive: 0, Neutral: 0, Negative: 0, ...toCountMap(trends.sentiments) };
    const classifiedFeedback = trends.themes.reduce((total, item) => total + item.count, 0);
    const topThemes = trends.themes.slice(0, 5).map((item) => ({ theme: item._id, count: item.count, percentage: totalFeedback ? Number(((item.count / totalFeedback) * 100).toFixed(1)) : 0 }));

    return response.status(200).json({
      success: true,
      data: {
        workspace: { id: workspaceId, name: request.aiInsightsWorkspace.name },
        totalFeedback,
        classifiedFeedback,
        themeCounts: trends.themes.map((item) => ({ theme: item._id, count: item.count })),
        themeVolume: trends.volume.map((item) => ({ date: item._id.date, theme: item._id.theme, count: item.count })),
        themeTrends,
        sentimentDistribution: sentimentMap,
        featureAreaDistribution: trends.featureAreas.map((item) => ({ featureArea: item._id, count: item.count })),
        mostCommonTheme: trends.themes[0]?._id || null,
        mostCommonFeatureArea: trends.featureAreas[0]?._id || null,
        topThemes,
      },
    });
  } catch (error) {
    return next(error);
  }
}
