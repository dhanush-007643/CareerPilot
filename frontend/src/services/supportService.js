import axios from 'axios';

const API_URL = '/api';

export const createFeedback = async (feedbackData) => {
  const response = await axios.post(`${API_URL}/feedback/create`, feedbackData);
  return response.data;
};

export const getMyFeedback = async () => {
  const response = await axios.get(`${API_URL}/feedback/my`);
  return response.data;
};

export const getAllFeedback = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const response = await axios.get(`${API_URL}/feedback/all?${query}`);
  return response.data;
};

export const getFeedbackById = async (id) => {
  const response = await axios.get(`${API_URL}/feedback/${id}`);
  return response.data;
};

export const replyToFeedback = async (data) => {
  const response = await axios.put(`${API_URL}/feedback/reply`, data);
  return response.data;
};

export const updateFeedbackStatus = async (ticketId, status) => {
  const response = await axios.put(`${API_URL}/feedback/status`, { ticketId, status });
  return response.data;
};

export const getChatHistory = async (userId) => {
  const response = await axios.get(`${API_URL}/support-chat/history/${userId}`);
  return response.data;
};

export const getConversations = async () => {
  const response = await axios.get(`${API_URL}/support-chat/conversations`);
  return response.data;
};

export const markChatAsRead = async (userId) => {
  const response = await axios.put(`${API_URL}/support-chat/read/${userId}`);
  return response.data;
};

export const sendChatMessageREST = async (data) => {
  const response = await axios.post(`${API_URL}/support-chat/send`, data);
  return response.data;
};
