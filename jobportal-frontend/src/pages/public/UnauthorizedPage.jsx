import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import Button from '../../components/common/Button';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

export const UnauthorizedPage = () => {
  const { role, isAuthenticated } = useAuth();

  const getHomePath = () => {
    if (!isAuthenticated) return '/';
    if (role === ROLES.RECRUITER) return '/recruiter/dashboard';
    if (role === ROLES.ADMIN) return '/admin/dashboard';
    return '/candidate/dashboard';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            403 Forbidden
          </span>

          <h1 className="text-2xl font-extrabold text-slate-900 mt-2 mb-3">
            Access Restricted
          </h1>

          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            You do not have the required permissions ({role || 'UNAUTHENTICATED'}) to view this protected resource.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={getHomePath()} className="w-full sm:w-auto">
              <Button variant="primary" className="w-full flex items-center gap-2">
                <Home className="w-4 h-4" />
                Return to Dashboard
              </Button>
            </Link>
            <Link to="/jobs" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Browse Jobs
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UnauthorizedPage;
