import axiosClient from './axiosClient';

export const authApi = {
  // Candidate Login
  login: (credentials) => {
    return axiosClient.post('/users/login', credentials);
  },

  // Recruiter Login
  recruiterLogin: (credentials) => {
    return axiosClient.post('/users/recruiters/login', credentials);
  },

  // Candidate Registration
  register: (userData) => {
    return axiosClient.post('/users/register', userData);
  },

  // Recruiter Registration
  registerRecruiter: (recruiterData) => {
    return axiosClient.post('/users/recruiters/register', recruiterData);
  },

  // Forgot Password
  forgotPassword: (email) => {
    return axiosClient.post('/users/forgot-password', { email });
  },

  // Verify OTP - accepts { email, otp } or (email, otp)
  verifyOtp: (emailOrData, optionalOtp) => {
    const payload =
      typeof emailOrData === 'object' && emailOrData !== null
        ? emailOrData
        : { email: emailOrData, otp: optionalOtp };
    return axiosClient.post('/users/verify-otp', payload);
  },

  // Reset Password - accepts { email, otp, newPassword } or (email, otp, newPassword)
  resetPassword: (emailOrData, optionalOtp, optionalNewPassword) => {
    const payload =
      typeof emailOrData === 'object' && emailOrData !== null
        ? emailOrData
        : { email: emailOrData, otp: optionalOtp, newPassword: optionalNewPassword };
    return axiosClient.post('/users/reset-password', payload);
  },
};

