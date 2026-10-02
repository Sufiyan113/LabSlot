import api from './api';
export const getOverview = async () => {
  const { data } = await api.get('/analytics/overview');
  return data;
};
export const getBookingAnalytics = async () => {
  const { data } = await api.get('/analytics/bookings');
  return data;
};
export const getEquipmentAnalytics = async () => {
  const { data } = await api.get('/analytics/equipment');
  return data;
};
export const getLabAnalytics = async () => {
  const { data } = await api.get('/analytics/labs');
  return data;
};
