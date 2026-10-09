import axiosClient from './axiosClient';

export const savedJobApi = {
  // Save job (POST /saved-jobs/{jobId})
  saveJob: (jobId) => {
    return axiosClient.post(`/saved-jobs/${jobId}`);
  },

  // Get candidate saved jobs (GET /saved-jobs/my)
  getMySavedJobs: () => {
    return axiosClient.get('/saved-jobs/my');
  },

  // Remove saved job (DELETE /saved-jobs/{jobId})
  removeSavedJob: (jobId) => {
    return axiosClient.delete(`/saved-jobs/${jobId}`);
  },
};
