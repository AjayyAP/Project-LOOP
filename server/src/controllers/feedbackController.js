import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import { classifyFeedback } from '../services/geminiService.js';

function serializeUser(user) {
  return user ? { id: user._id, fullName: user.fullName, email: user.email } : null;
}

function serializeFeedback(feedback) {
  return {
    id: feedback._id,
    workspace: feedback.workspace?.name ? { id: feedback.workspace._id, name: feedback.workspace.name } : feedback.workspace?._id || feedback.workspace,
    title: feedback.title,
    description: feedback.description,
    category: feedback.category,
    priority: feedback.priority,
    status: feedback.status,
    createdBy: serializeUser(feedback.createdBy),
    assignedTo: serializeUser(feedback.assignedTo),
    sentiment: feedback.sentiment || null,
    sentimentScore: Number.isFinite(feedback.sentimentScore) ? feedback.sentimentScore : null,
    theme: feedback.theme || null,
    featureArea: feedback.featureArea || null,
    aiSummary: feedback.aiSummary || null,
    createdAt: feedback.createdAt,
    updatedAt: feedback.updatedAt,
  };
}

export async function createFeedback(request, response, next) {
  try {
    const { title, description, category, priority, assignedTo } = request.body;
    const existingThemes = await Feedback.distinct('theme', {
      workspace: request.feedbackWorkspace._id,
      theme: { $type: 'string', $ne: '' },
    });
    const aiAnalysis = await classifyFeedback({ title, description, existingThemes });

    if (assignedTo && !(await WorkspaceMember.exists({ workspace: request.feedbackWorkspace._id, user: assignedTo }))) {
      return response.status(422).json({ success: false, message: 'The assignee must belong to this workspace.' });
    }

    const feedback = await Feedback.create({
      workspace: request.feedbackWorkspace._id,
      title,
      description,
      category,
      priority,
      createdBy: request.user._id,
      assignedTo: assignedTo || null,
      ...aiAnalysis,
    });
    await feedback.populate([{ path: 'createdBy', select: 'fullName email' }, { path: 'assignedTo', select: 'fullName email' }]);

    return response.status(201).json({ success: true, message: 'Feedback created successfully.', data: { feedback: serializeFeedback(feedback) } });
  } catch (error) {
    return next(error);
  }
}

export async function getWorkspaceFeedback(request, response, next) {
  try {
    const { search, status, priority, category, channel, sentiment, theme, sort = 'newest', dateRange, startDate, endDate } = request.query;
    const requestedPage = Number.parseInt(request.query.page, 10);
    const requestedLimit = Number.parseInt(request.query.limit, 10);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 50) : 10;
    const match = { workspace: request.feedbackWorkspace._id };

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      match.title = { $regex: escapedSearch, $options: 'i' };
    }
    if (status) match.status = status;
    if (priority) match.priority = priority;
    if (category) match.category = category;
    if (channel) match.channel = channel;
    if (sentiment) match.sentiment = sentiment;
    if (theme) match.theme = theme;

    if (dateRange === 'Today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      match.createdAt = { $gte: today };
    } else if (dateRange === 'Last 7 Days') {
      match.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (dateRange === 'Last 30 Days') {
      match.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    } else if (dateRange === 'Custom Range' && startDate && endDate) {
      const rangeEnd = new Date(endDate);
      rangeEnd.setHours(23, 59, 59, 999);
      match.createdAt = { $gte: new Date(startDate), $lte: rangeEnd };
    }

    const sortStage = sort === 'oldest'
      ? { createdAt: 1 }
      : sort === 'priority'
        ? { priorityRank: -1, createdAt: -1 }
        : { createdAt: -1 };
    const skip = (page - 1) * limit;
    const [result, availableThemes] = await Promise.all([
      Feedback.aggregate([
        { $match: match },
        { $addFields: { priorityRank: { $switch: { branches: [{ case: { $eq: ['$priority', 'High'] }, then: 3 }, { case: { $eq: ['$priority', 'Medium'] }, then: 2 }], default: 1 } } } },
        { $sort: sortStage },
        {
          $facet: {
            feedback: [
              { $skip: skip },
              { $limit: limit },
              { $lookup: { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'creator' } },
              { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } },
              { $project: { _id: 1, title: 1, description: 1, category: 1, priority: 1, status: 1, channel: 1, sentiment: 1, theme: 1, createdAt: 1, 'creator._id': 1, 'creator.fullName': 1, 'creator.email': 1 } },
            ],
            total: [{ $count: 'count' }],
          },
        },
      ]),
      Feedback.distinct('theme', { workspace: request.feedbackWorkspace._id, theme: { $type: 'string', $ne: '' } }),
    ]);
    const totalItems = result[0].total[0]?.count || 0;
    const feedback = result[0].feedback.map((item) => ({
      id: item._id,
      title: item.title,
      description: item.description,
      category: item.category,
      priority: item.priority,
      status: item.status,
      channel: item.channel || 'Manual',
      sentiment: item.sentiment || null,
      theme: item.theme || null,
      createdBy: item.creator ? { id: item.creator._id, fullName: item.creator.fullName, email: item.creator.email } : null,
      createdAt: item.createdAt,
    }));

    return response.status(200).json({
      success: true,
      data: {
        feedback,
        availableThemes: availableThemes.sort(),
        viewerRole: request.feedbackWorkspaceMembership.role,
        pagination: { page, limit, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / limit)) },
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getFeedback(request, response, next) {
  try {
    await request.feedback.populate([{ path: 'workspace', select: 'name' }, { path: 'createdBy', select: 'fullName email' }, { path: 'assignedTo', select: 'fullName email' }]);
    return response.status(200).json({ success: true, data: { feedback: { ...serializeFeedback(request.feedback), viewerRole: request.feedbackMembership.role } } });
  } catch (error) {
    return next(error);
  }
}

export async function updateFeedback(request, response, next) {
  try {
    const { title, description, category, priority } = request.body;
    Object.assign(request.feedback, { title, description, category, priority });
    await request.feedback.save();
    await request.feedback.populate([{ path: 'createdBy', select: 'fullName email' }, { path: 'assignedTo', select: 'fullName email' }]);
    return response.status(200).json({ success: true, message: 'Feedback updated successfully.', data: { feedback: serializeFeedback(request.feedback) } });
  } catch (error) {
    return next(error);
  }
}

export async function deleteFeedback(request, response, next) {
  try {
    await request.feedback.deleteOne();
    return response.status(200).json({ success: true, message: 'Feedback deleted successfully.' });
  } catch (error) {
    return next(error);
  }
}

export async function updateFeedbackStatus(request, response, next) {
  try {
    request.feedback.status = request.body.status;
    await request.feedback.save();
    await request.feedback.populate([{ path: 'createdBy', select: 'fullName email' }, { path: 'assignedTo', select: 'fullName email' }]);
    return response.status(200).json({ success: true, message: 'Feedback status updated.', data: { feedback: serializeFeedback(request.feedback) } });
  } catch (error) {
    return next(error);
  }
}

export async function assignFeedback(request, response, next) {
  try {
    const { assignedTo } = request.body;
    if (!(await User.exists({ _id: assignedTo }))) {
      return response.status(404).json({ success: false, message: 'Assigned user not found.' });
    }
    if (!(await WorkspaceMember.exists({ workspace: request.feedback.workspace, user: assignedTo }))) {
      return response.status(422).json({ success: false, message: 'The assigned user must belong to this workspace.' });
    }
    request.feedback.assignedTo = assignedTo;
    await request.feedback.save();
    await request.feedback.populate([{ path: 'createdBy', select: 'fullName email' }, { path: 'assignedTo', select: 'fullName email' }]);
    return response.status(200).json({ success: true, message: 'Feedback assigned successfully.', data: { feedback: serializeFeedback(request.feedback) } });
  } catch (error) {
    return next(error);
  }
}
