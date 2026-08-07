import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';

export async function requireVocReportWorkspaceMember(request, response, next) {
  try {
    const workspace = await Workspace.findById(request.params.workspaceId);
    if (!workspace) {
      return response.status(404).json({ success: false, message: 'Workspace not found.' });
    }

    if (!(await WorkspaceMember.exists({ workspace: workspace._id, user: request.user._id }))) {
      return response.status(403).json({ success: false, message: 'You do not have access to this workspace.' });
    }

    request.vocReportWorkspace = workspace;
    return next();
  } catch (error) {
    return next(error);
  }
}
