import axiosClient from './axiosClient';

export const userApi = {
  // Current user profile
  getProfile: () => {
    return axiosClient.get('/users/profile');
  },

  updateProfile: (profileData) => {
    return axiosClient.patch('/users/profile', profileData);
  },

  addSkill: (skill) => {
    return axiosClient.post('/users/skills', { skill });
  },

  removeSkill: (skill) => {
    return axiosClient.delete('/users/skills', {
      data: { skill },
    });
  },

  changePassword: (passwordData, newPasswordArg) => {
    const payload = typeof passwordData === 'object'
      ? passwordData
      : { oldPassword: passwordData, newPassword: newPasswordArg };
    return axiosClient.patch('/users/change-password', payload);
  },

  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/users/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  downloadResume: (userId) => {
    return axiosClient.get(`/users/resume/${userId}`, {
      responseType: 'blob',
    });
  },

  getProfileCompletion: () => {
    return axiosClient.get('/users/profile-completion');
  },

  // Admin User APIs
  getAllUsers: () => {
    return axiosClient.get('/users');
  },

  getUserById: (userId) => {
    return axiosClient.get(`/users/${userId}`);
  },

  createUser: (userData) => {
    return axiosClient.post('/users', userData);
  },

  updateUser: (userId, userData) => {
    return axiosClient.put(`/users/${userId}`, userData);
  },

  deleteUser: (userId) => {
    return axiosClient.delete(`/users/${userId}`);
  },
};
