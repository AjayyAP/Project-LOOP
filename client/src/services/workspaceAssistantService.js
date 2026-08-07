import api from './api';

export async function askWorkspaceQuestion(workspaceId, question) {
  const { data } = await api.post(`/workspaces/${workspaceId}/ai/ask`, { question });
  return data.data;
}
