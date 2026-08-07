import api from './api';

export async function importSampleChannel(workspaceId, channel) {
  const { data } = await api.post(`/workspaces/${workspaceId}/feedback/import-sample-channel`, { channel });
  return data;
}
