import api from './api';

const API_URL = '/admin'; // api.js already prepends /api

export const getAdminProfile = async () => {
  const response = await api.get(`${API_URL}/profile`);
  return response.data;
};

export const updateAdminProfile = async (profileData) => {
  const response = await api.put(`${API_URL}/profile`, profileData);
  return response.data;
};

export const changeAdminPassword = async (passwordData) => {
  const response = await api.put(`${API_URL}/change-password`, passwordData);
  return response.data;
};
