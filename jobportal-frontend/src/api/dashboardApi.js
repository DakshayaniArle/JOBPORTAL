import axiosClient from './axiosClient';

export const dashboardApi = {
  // Admin dashboard metrics
  getAdminDashboard: () => {
    return axiosClient.get('/dashboard');
  },

  // Recruiter dashboard metrics
  getRecruiterDashboard: () => {
    return axiosClient.get('/dashboard/recruiter');
  },

  // Candidate dashboard metrics (derived or backend)
  getCandidateDashboard: () => {
    return axiosClient.get('/dashboard/candidate').catch(() => null);
  },
};

