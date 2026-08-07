import api from './api';

export async function generateVocReport(workspaceId, filters = {}) {
  const { data } = await api.post(`/workspaces/${workspaceId}/ai/report`, filters);
  return data.data;
}

export async function fetchVocReports(workspaceId) {
  const { data } = await api.get(`/workspaces/${workspaceId}/ai/reports`);
  return data.data.reports;
}

export async function fetchVocReport(workspaceId, reportId) {
  const { data } = await api.get(`/workspaces/${workspaceId}/ai/reports/${reportId}`);
  return data.data.report;
}
