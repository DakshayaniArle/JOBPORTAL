import axiosClient from './axiosClient';

export const applicationApi = {
  // Candidate apply for job (POST /applications/apply/{jobId})
  applyJob: (jobId) => {
    return axiosClient.post(`/applications/apply/${jobId}`);
  },

  // Candidate applications (GET /applications/my)
  getMyApplications: () => {
    return axiosClient.get('/applications/my');
  },

  // Candidate withdraw application (PUT /applications/{id}/withdraw)
  withdrawApplication: (applicationId) => {
    return axiosClient.put(`/applications/${applicationId}/withdraw`);
  },

  // Candidate accept offer (PUT /applications/{id}/accept-offer)
  acceptOffer: (applicationId) => {
    return axiosClient.put(`/applications/${applicationId}/accept-offer`);
  },

  // Recruiter view applicants for their job (GET /applications/recruiter/job/{jobId})
  getApplicantsForRecruiterJob: (jobId) => {
    return axiosClient.get(`/applications/recruiter/job/${jobId}`);
  },

  // Recruiter update status (PUT /applications/recruiter/{id}/status with @RequestBody { status: "..." })
  recruiterUpdateStatus: (applicationId, status) => {
    return axiosClient.put(`/applications/recruiter/${applicationId}/status`, { status });
  },

  // Admin view all applications for a job (GET /applications/job/{jobId})
  getApplicationsByJob: (jobId) => {
    return axiosClient.get(`/applications/job/${jobId}`);
  },

  // Admin update application status (PUT /applications/{id}/status?status=...)
  adminUpdateStatus: (applicationId, status) => {
    return axiosClient.put(`/applications/${applicationId}/status?status=${encodeURIComponent(status)}`);
  },
};
