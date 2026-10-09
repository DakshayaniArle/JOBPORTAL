import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';

const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" text="Verifying permissions..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    const isRecruiterPath = location.pathname.startsWith('/recruiter');
    const redirectUrl = isRecruiterPath ? '/recruiter/login' : '/login';
    return <Navigate to={redirectUrl} state={{ from: location }} replace />;
  }

  // Exact matching against backend role (USER, RECRUITER, ADMIN)
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleRoute;

