import api from './api';

export async function fetchWorkspaceDashboard(workspaceId, filters = {}) {
  const { data } = await api.get(`/workspaces/${workspaceId}/dashboard`, { params: filters });
  return data.data;
}
