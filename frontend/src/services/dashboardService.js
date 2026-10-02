import api from './api';
export const getStudentDashboard = async () => {
  const { data } = await api.get('/dashboard/student');
  return data;
};
export const getAssistantDashboard = async () => {
  const { data } = await api.get('/dashboard/assistant');
  return data;
};
export const getAdminDashboard = async () => {
  const { data } = await api.get('/dashboard/admin');
  return data;
};
