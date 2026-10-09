import axiosClient from './axiosClient';

export const interviewApi = {
  // Recruiter schedule interview (POST /interviews/schedule)
  scheduleInterview: (interviewData) => {
    return axiosClient.post('/interviews/schedule', interviewData);
  },

  // Candidate view their interviews (GET /interviews/my-interviews)
  getMyInterviews: () => {
    return axiosClient.get('/interviews/my-interviews');
  },

  // Recruiter view their interviews (GET /interviews/recruiter)
  getRecruiterInterviews: () => {
    return axiosClient.get('/interviews/recruiter');
  },
};
