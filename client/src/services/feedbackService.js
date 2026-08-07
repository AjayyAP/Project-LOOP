import api from './api';

export async function fetchWorkspaceFeedback(workspaceId, filters = {}) {
  const { data } = await api.get(`/workspaces/${workspaceId}/feedback`, { params: filters });
  return data.data;
}

export async function createFeedback(workspaceId, payload) {
  const { data } = await api.post(`/workspaces/${workspaceId}/feedback`, payload);
  return data;
}

export async function fetchFeedback(feedbackId) {
  const { data } = await api.get(`/feedback/${feedbackId}`);
  return data.data.feedback;
}

export async function updateFeedback(feedbackId, payload) {
  const { data } = await api.put(`/feedback/${feedbackId}`, payload);
  return data;
}

export async function deleteFeedback(feedbackId) {
  const { data } = await api.delete(`/feedback/${feedbackId}`);
  return data;
}

export async function updateFeedbackStatus(feedbackId, status) {
  const { data } = await api.patch(`/feedback/${feedbackId}/status`, { status });
  return data;
}

export async function reclassifyFeedback(feedbackId) {
  const { data } = await api.post(`/feedback/${feedbackId}/reclassify-ai`);
  return data;
}

export async function assignFeedback(feedbackId, assignedTo) {
  const { data } = await api.patch(`/feedback/${feedbackId}/assign`, { assignedTo });
  return data;
}

export async function importFeedbackCsv(workspaceId, file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post(`/workspaces/${workspaceId}/feedback/import`, formData, {
    onUploadProgress: (event) => {
      if (event.total) onProgress(Math.round((event.loaded * 100) / event.total));
    },
  });
  return data;
}
