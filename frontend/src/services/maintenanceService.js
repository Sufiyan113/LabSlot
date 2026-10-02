import api from './api';
export const getMaintenance = async (params = {}) => {
  const { data } = await api.get('/maintenance', { params });
  return data;
};
export const createMaintenance = async (payload) => {
  const { data } = await api.post('/maintenance', payload);
  return data;
};
export const updateMaintenance = async (id, payload) => {
  const { data } = await api.put(`/maintenance/${id}`, payload);
  return data;
};
export const completeMaintenance = async (id, notes) => {
  const { data } = await api.put(`/maintenance/${id}/complete`, { resolutionNotes: notes });
  return data;
};

export const getMaintenanceStats = async () => {
  const { data } = await api.get('/maintenance/stats');
  return data;
};
