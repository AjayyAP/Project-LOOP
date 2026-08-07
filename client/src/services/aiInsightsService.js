import api from './api';

export async function fetchThemeTrends(workspaceId, filters = {}) {
  const { data } = await api.get(`/workspaces/${workspaceId}/ai/theme-trends`, { params: filters });
  return data.data;
}
