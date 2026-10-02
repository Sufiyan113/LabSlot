import api from './api';

export const getLabs = async (params = {}) => {
  const { data } = await api.get('/labs', { params });
  return data;
};

export const getLab = async (id) => {
  const { data } = await api.get(`/labs/${id}`);
  return data;
};

export const createLab = async (payload) => {
  const { data } = await api.post('/labs', payload);
  return data;
};

export const updateLab = async (id, payload) => {
  const { data } = await api.put(`/labs/${id}`, payload);
  return data;
};

export const deleteLab = async (id) => {
  const { data } = await api.delete(`/labs/${id}`);
  return data;
};
