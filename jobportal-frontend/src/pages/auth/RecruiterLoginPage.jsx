import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/authApi';
import { ROLES } from '../../utils/constants';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Building2, AlertCircle, ArrowLeft } from 'lucide-react';

export const RecruiterLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(
        {
          email: formData.email.trim(),
          password: formData.password,
        },
        true // isRecruiter = true (calls /users/recruiters/login)
      );

      const destination = location.state?.from?.pathname;
      if (destination) {
        navigate(destination, { replace: true });
      } else {
        navigate('/recruiter/dashboard', { replace: true });
      }
    } catch (err) {
      setError(
        err?.userMessage || err?.message || 'Invalid recruiter credentials or unauthorized role.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-900 flex items-center justify-center text-white shadow-lg shadow-indigo-200 mx-auto mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Employer Portal
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Recruiter Sign In
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Access your hiring dashboard and manage applicants.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl">
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Company Email"
                id="email"
                name="email"
                type="email"
                placeholder="recruiter@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <div>
                <Input
                  label="Password"
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <div className="flex justify-end mt-1.5">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={loading}
              >
                Sign In to Recruiter Workspace
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500 space-y-3">
              <p>
                New hiring organization?{' '}
                <Link
                  to="/recruiter/register"
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Register Company
                </Link>
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Candidate Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RecruiterLoginPage;
