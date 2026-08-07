import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';

export async function requireWorkspaceMember(request, response, next) {
  try {
    const workspace = await Workspace.findById(request.params.id);

    if (!workspace) {
      return response.status(404).json({ success: false, message: 'Workspace not found.' });
    }

    const membership = await WorkspaceMember.findOne({ workspace: workspace._id, user: request.user._id });

    if (!membership) {
      return response.status(403).json({ success: false, message: 'You do not have access to this workspace.' });
    }

    request.workspace = workspace;
    request.workspaceMembership = membership;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireWorkspaceAdmin(request, response, next) {
  if (request.workspaceMembership.role !== 'Admin') {
    return response.status(403).json({ success: false, message: 'Only workspace admins can add members.' });
  }

  return next();
}
