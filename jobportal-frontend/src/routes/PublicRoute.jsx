import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../utils/constants';
import Spinner from '../components/common/Spinner';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect to their respective dashboard
    if (role === ROLES.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (role === ROLES.RECRUITER) {
      return <Navigate to="/recruiter/dashboard" replace />;
    }
    return <Navigate to="/candidate/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
