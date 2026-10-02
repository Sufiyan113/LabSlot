import api from './api';

export const getBookings = async (params = {}) => {
  const { data } = await api.get('/bookings', { params });
  return data;
};

export const getBooking = async (id) => {
  const { data } = await api.get(`/bookings/${id}`);
  return data;
};

export const createBooking = async (payload) => {
  const { data } = await api.post('/bookings', payload);
  return data;
};

export const cancelBooking = async (id) => {
  const { data } = await api.put(`/bookings/${id}/cancel`);
  return data;
};

export const approveBooking = async (id) => {
  const { data } = await api.put(`/bookings/${id}/approve`);
  return data;
};

export const rejectBooking = async (id, reason) => {
  const { data } = await api.put(`/bookings/${id}/reject`, { reason });
  return data;
};

export const issueBooking = async (id, notes) => {
  const { data } = await api.put(`/bookings/${id}/issue`, { notes });
  return data;
};

export const returnBooking = async (id, notes) => {
  const { data } = await api.put(`/bookings/${id}/return`, { notes });
  return data;
};
