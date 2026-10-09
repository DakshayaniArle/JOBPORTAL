import axiosClient from './axiosClient';

export const jobApi = {
  // Public Job Listings
  getJobs: (pageOrParams = 0, sizeParam = 10) => {
    const isObj = typeof pageOrParams === 'object' && pageOrParams !== null;
    const p = isObj ? (pageOrParams.page ?? 0) : (pageOrParams ?? 0);
    const s = isObj ? (pageOrParams.size ?? 10) : (sizeParam ?? 10);
    return axiosClient.get(`/jobs?page=${p}&size=${s}`);
  },

  getJobById: (jobId) => {
    return axiosClient.get(`/jobs/${jobId}`);
  },

  searchJobs: (keyword) => {
    return axiosClient.get(`/jobs/search?keyword=${encodeURIComponent(keyword)}`);
  },

  filterJobs: (params) => {
    const query = new URLSearchParams();
    if (params.title) query.append('title', params.title);
    if (params.location) query.append('location', params.location);
    if (params.company) query.append('company', params.company);
    if (params.skill) query.append('skill', params.skill);
    if (params.jobType) query.append('jobType', params.jobType);
    if (params.experience !== undefined && params.experience !== '') query.append('experience', params.experience);
    if (params.minSalary !== undefined && params.minSalary !== '') query.append('minSalary', params.minSalary);
    return axiosClient.get(`/jobs/filter?${query.toString()}`);
  },

  // Candidate Recommended Jobs
  getRecommendedJobs: () => {
    return axiosClient.get('/jobs/recommended');
  },

  // Recruiter Jobs
  getMyJobs: () => {
    return axiosClient.get('/jobs/my-jobs');
  },

  createJob: (jobData) => {
    return axiosClient.post('/jobs', jobData);
  },

  updateJob: (jobId, jobData) => {
    return axiosClient.put(`/jobs/${jobId}`, jobData);
  },

  closeJob: (jobId) => {
    return axiosClient.put(`/jobs/${jobId}/close`);
  },

  reopenJob: (jobId) => {
    return axiosClient.put(`/jobs/${jobId}/reopen`);
  },

  extendExpiry: (jobId, days = 15) => {
    return axiosClient.put(`/jobs/${jobId}/extend?days=${days}`);
  },

  deleteJob: (jobId) => {
    return axiosClient.delete(`/jobs/${jobId}`);
  },
};
