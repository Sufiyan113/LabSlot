import api from './api';

export const getEquipment = async (params = {}) => {
  const { data } = await api.get('/equipment', { params });
  return data;
};

export const getEquipmentById = async (id) => {
  const { data } = await api.get(`/equipment/${id}`);
  return data;
};

export const getAvailability = async (id, date) => {
  const { data } = await api.get(`/equipment/${id}/availability`, { params: { date } });
  return data;
};

export const createEquipment = async (payload) => {
  const { data } = await api.post('/equipment', payload);
  return data;
};

export const updateEquipment = async (id, payload) => {
  const { data } = await api.put(`/equipment/${id}`, payload);
  return data;
};

export const deleteEquipment = async (id) => {
  const { data } = await api.delete(`/equipment/${id}`);
  return data;
};

export const generateQR = async (id) => {
  const { data } = await api.post(`/equipment/${id}/qr`);
  return data;
};

