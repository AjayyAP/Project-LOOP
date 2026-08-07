import api from './api';

export async function fetchWorkspaces() {
  const { data } = await api.get('/workspaces');
  return data.data.workspaces;
}

export async function createWorkspace(payload) {
  const { data } = await api.post('/workspaces', payload);
  return data;
}

export async function fetchWorkspace(workspaceId) {
  const { data } = await api.get(`/workspaces/${workspaceId}`);
  return data.data.workspace;
}

export async function fetchWorkspaceMembers(workspaceId) {
  const { data } = await api.get(`/workspaces/${workspaceId}/members`);
  return data.data.members;
}

export async function addWorkspaceMember(workspaceId, payload) {
  const { data } = await api.post(`/workspaces/${workspaceId}/members`, payload);
  return data;
}

export async function updateWorkspaceMemberRole(workspaceId, memberId, role) {
  const { data } = await api.patch(`/workspaces/${workspaceId}/members/${memberId}/role`, { role });
  return data;
}
