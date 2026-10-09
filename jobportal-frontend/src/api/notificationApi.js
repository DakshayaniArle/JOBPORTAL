import axiosClient from './axiosClient';

export const notificationApi = {
  getMyNotifications: async () => {
    try {
      const data = await axiosClient.get('/notifications/my');
      return data;
    } catch {
      return [];
    }
  },

  getUnreadCount: async () => {
    try {
      const count = await axiosClient.get('/notifications/unread-count');
      return count;
    } catch (e) {
      return 0;
    }
  },

  markAllAsRead: async () => {
    try {
      await axiosClient.put('/notifications/mark-all-read');
      return true;
    } catch {
      return false;
    }
  },

  markAsRead: async (id) => {
    try {
      await axiosClient.put(`/notifications/${id}/read`);
      return true;
    } catch {
      return false;
    }
  },
};
