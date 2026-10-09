import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import PublicRoute from './PublicRoute';
import { ROLES } from '../utils/constants';

// Public Pages
import HomePage from '../pages/public/HomePage';
import JobsPage from '../pages/public/JobsPage';
import JobDetailPage from '../pages/public/JobDetailPage';
import UnauthorizedPage from '../pages/public/UnauthorizedPage';
import NotFoundPage from '../pages/public/NotFoundPage';

// Auth Pages
import CandidateLoginPage from '../pages/auth/CandidateLoginPage';
import CandidateRegisterPage from '../pages/auth/CandidateRegisterPage';
import RecruiterLoginPage from '../pages/auth/RecruiterLoginPage';
import RecruiterRegisterPage from '../pages/auth/RecruiterRegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import VerifyOtpPage from '../pages/auth/VerifyOtpPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Candidate Pages
import CandidateDashboardPage from '../pages/candidate/CandidateDashboardPage';
import RecommendedJobsPage from '../pages/candidate/RecommendedJobsPage';
import MyApplicationsPage from '../pages/candidate/MyApplicationsPage';
import SavedJobsPage from '../pages/candidate/SavedJobsPage';
import CandidateInterviewsPage from '../pages/candidate/CandidateInterviewsPage';
import CandidateProfilePage from '../pages/candidate/CandidateProfilePage';
import ChangePasswordPage from '../pages/candidate/ChangePasswordPage';
import NotificationsPage from '../pages/candidate/NotificationsPage';

// Recruiter Pages
import RecruiterDashboardPage from '../pages/recruiter/RecruiterDashboardPage';
import PostJobPage from '../pages/recruiter/PostJobPage';
import MyJobsPage from '../pages/recruiter/MyJobsPage';
import JobApplicantsPage from '../pages/recruiter/JobApplicantsPage';
import ScheduleInterviewPage from '../pages/recruiter/ScheduleInterviewPage';
import RecruiterInterviewsPage from '../pages/recruiter/RecruiterInterviewsPage';
import RecruiterProfilePage from '../pages/recruiter/RecruiterProfilePage';
import EditJobPage from '../pages/recruiter/EditJobPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminUserDetailPage from '../pages/admin/AdminUserDetailPage';
import AdminJobsPage from '../pages/admin/AdminJobsPage';
import AdminJobApplicationsPage from '../pages/admin/AdminJobApplicationsPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}
      <Route path="/" element={<HomePage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/jobs/:jobId" element={<JobDetailPage />} />
      <Route path="/jobs/view/:jobId" element={<JobDetailPage />} />

      {/* Auth Routes (Protected from already logged-in users via PublicRoute) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <CandidateLoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <CandidateRegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/recruiter/login"
        element={
          <PublicRoute>
            <RecruiterLoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/recruiter/register"
        element={
          <PublicRoute>
            <RecruiterRegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/verify-otp"
        element={
          <PublicRoute>
            <VerifyOtpPage />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />

      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ================= CANDIDATE (USER) PROTECTED ROUTES ================= */}
      <Route
        path="/candidate/dashboard"
        element={
          <RoleRoute allowedRoles={[ROLES.USER]}>
            <CandidateDashboardPage />
          </RoleRoute>
        }
      />
      <Route
        path="/candidate/recommended-jobs"
        element={
          <RoleRoute allowedRoles={[ROLES.USER]}>
            <RecommendedJobsPage />
          </RoleRoute>
        }
      />
      {/* Alias */}
      <Route
        path="/candidate/recommendations"
        element={
          <RoleRoute allowedRoles={[ROLES.USER]}>
            <RecommendedJobsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/candidate/applications"
        element={
          <RoleRoute allowedRoles={[ROLES.USER]}>
            <MyApplicationsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/candidate/saved-jobs"
        element={
          <RoleRoute allowedRoles={[ROLES.USER]}>
            <SavedJobsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/candidate/interviews"
        element={
          <RoleRoute allowedRoles={[ROLES.USER]}>
            <CandidateInterviewsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/candidate/profile"
        element={
          <RoleRoute allowedRoles={[ROLES.USER]}>
            <CandidateProfilePage />
          </RoleRoute>
        }
      />
      <Route
        path="/candidate/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* ================= RECRUITER PROTECTED ROUTES ================= */}
      <Route
        path="/recruiter/dashboard"
        element={
          <RoleRoute allowedRoles={[ROLES.RECRUITER]}>
            <RecruiterDashboardPage />
          </RoleRoute>
        }
      />
      <Route
        path="/recruiter/post-job"
        element={
          <RoleRoute allowedRoles={[ROLES.RECRUITER]}>
            <PostJobPage />
          </RoleRoute>
        }
      />
      {/* Alias */}
      <Route
        path="/recruiter/jobs/new"
        element={
          <RoleRoute allowedRoles={[ROLES.RECRUITER]}>
            <PostJobPage />
          </RoleRoute>
        }
      />
      <Route
        path="/recruiter/jobs"
        element={
          <RoleRoute allowedRoles={[ROLES.RECRUITER]}>
            <MyJobsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/recruiter/jobs/:jobId/edit"
        element={
          <RoleRoute allowedRoles={[ROLES.RECRUITER]}>
            <EditJobPage />
          </RoleRoute>
        }
      />
      <Route
        path="/recruiter/edit-job/:jobId"
        element={
          <RoleRoute allowedRoles={[ROLES.RECRUITER]}>
            <EditJobPage />
          </RoleRoute>
        }
      />
      <Route
        path="/recruiter/jobs/:jobId/applicants"
        element={
          <RoleRoute allowedRoles={[ROLES.RECRUITER]}>
            <JobApplicantsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/recruiter/schedule-interview/:applicationId"
        element={
          <RoleRoute allowedRoles={[ROLES.RECRUITER]}>
            <ScheduleInterviewPage />
          </RoleRoute>
        }
      />
      {/* Aliases for interview scheduling */}
      <Route
        path="/recruiter/interviews/schedule/:applicationId"
        element={
          <RoleRoute allowedRoles={[ROLES.RECRUITER]}>
            <ScheduleInterviewPage />
          </RoleRoute>
        }
      />
      <Route
        path="/recruiter/schedule-interview"
        element={
          <RoleRoute allowedRoles={[ROLES.RECRUITER]}>
            <ScheduleInterviewPage />
          </RoleRoute>
        }
      />
      <Route
        path="/recruiter/interviews"
        element={
          <RoleRoute allowedRoles={[ROLES.RECRUITER]}>
            <RecruiterInterviewsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/recruiter/profile"
        element={
          <RoleRoute allowedRoles={[ROLES.RECRUITER]}>
            <RecruiterProfilePage />
          </RoleRoute>
        }
      />
      <Route
        path="/recruiter/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* ================= ADMIN PROTECTED ROUTES ================= */}
      <Route
        path="/admin/dashboard"
        element={
          <RoleRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminDashboardPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RoleRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminUsersPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/users/:userId"
        element={
          <RoleRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminUserDetailPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/jobs"
        element={
          <RoleRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminJobsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/jobs/:jobId/applications"
        element={
          <RoleRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminJobApplicationsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* ================= 404 CATCH-ALL ================= */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
