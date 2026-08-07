import Feedback from '../models/Feedback.js';
import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';

export async function requireFeedbackWorkspaceMember(request, response, next) {
  try {
    const workspace = await Workspace.findById(request.params.workspaceId);
    if (!workspace) {
      return response.status(404).json({ success: false, message: 'Workspace not found.' });
    }

    const membership = await WorkspaceMember.findOne({ workspace: workspace._id, user: request.user._id });
    if (!membership) {
      return response.status(403).json({ success: false, message: 'You do not have access to this workspace.' });
    }

    request.feedbackWorkspace = workspace;
    request.feedbackWorkspaceMembership = membership;
    return next();
  } catch (error) {
    return next(error);
  }
}

export async function requireFeedbackMember(request, response, next) {
  try {
    const feedback = await Feedback.findById(request.params.id);
    if (!feedback) {
      return response.status(404).json({ success: false, message: 'Feedback not found.' });
    }

    const membership = await WorkspaceMember.findOne({ workspace: feedback.workspace, user: request.user._id });
    if (!membership) {
      return response.status(403).json({ success: false, message: 'You do not have access to this feedback.' });
    }

    request.feedback = feedback;
    request.feedbackMembership = membership;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireFeedbackEditor(request, response, next) {
  if (!['Admin', 'Analyst'].includes(request.feedbackMembership.role)) {
    return response.status(403).json({ success: false, message: 'Permission denied.' });
  }
  return next();
}

export function requireFeedbackAdmin(request, response, next) {
  if (request.feedbackMembership.role !== 'Admin') {
    return response.status(403).json({ success: false, message: 'Only workspace Admins can assign feedback.' });
  }
  return next();
}
