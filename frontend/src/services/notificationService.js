import api from './api';

export const getNotifications = async () => {
  try {
    const res = await api.get('/notifications/user');
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch notifications' };
  }
};

export const markAsRead = async (id) => {
  try {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark notification as read' };
  }
};

export const markAllAsRead = async () => {
  try {
    const res = await api.put('/notifications/read-all');
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark all as read' };
  }
};
