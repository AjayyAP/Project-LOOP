import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';

export async function requireAiInsightsWorkspaceMember(request, response, next) {
  try {
    const workspace = await Workspace.findById(request.params.workspaceId);
    if (!workspace) {
      return response.status(404).json({ success: false, message: 'Workspace not found.' });
    }

    const membership = await WorkspaceMember.exists({ workspace: workspace._id, user: request.user._id });
    if (!membership) {
      return response.status(403).json({ success: false, message: 'You do not have access to this workspace.' });
    }

    request.aiInsightsWorkspace = workspace;
    return next();
  } catch (error) {
    return next(error);
  }
}
