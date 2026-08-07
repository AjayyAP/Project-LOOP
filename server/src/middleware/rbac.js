export const workspaceRoles = ['Admin', 'Analyst', 'Viewer'];

export function requireUserRole(...allowedRoles) {
  return (request, response, next) => {
    if (!allowedRoles.includes(request.user.role)) {
      return response.status(403).json({ success: false, message: 'Permission denied.' });
    }
    return next();
  };
}

export function requireWorkspaceRole(...allowedRoles) {
  return (request, response, next) => {
    const membership = request.workspaceMembership || request.feedbackMembership || request.feedbackWorkspaceMembership;
    if (!membership || !allowedRoles.includes(membership.role)) {
      return response.status(403).json({ success: false, message: 'Permission denied.' });
    }
    return next();
  };
}
