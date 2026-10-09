import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RecruiterRegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    skill: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    try {
      await authApi.registerRecruiter({
        name: formData.name.trim(),
        email: formData.email.trim(),
        company: formData.company.trim(),
        skill: formData.skill.trim(),
        password: formData.password,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/recruiter/login');
      }, 2000);
    } catch (err) {
      setError(
        err.userMessage || 'Recruiter registration failed. Please try again.'
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
              Employer Registration
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Create Recruiter Account
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Start posting jobs and sourcing candidates today.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl">
            {success && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Company registered successfully! Redirecting to sign in...</span>
              </div>
            )}

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Recruiter / HR Name"
                id="name"
                name="name"
                placeholder="Sarah Connor"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <Input
                label="Company / Organization Name"
                id="company"
                name="company"
                placeholder="Cyberdyne Systems"
                value={formData.company}
                onChange={handleChange}
                required
              />

              <Input
                label="Work Email Address"
                id="email"
                name="email"
                type="email"
                placeholder="sarah@cyberdyne.com"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <Input
                label="Domain / Primary Focus Skills"
                id="skill"
                name="skill"
                placeholder="e.g. IT, Engineering, Java, Cloud"
                helperText="Primary industry or tech domains."
                value={formData.skill}
                onChange={handleChange}
                required
              />

              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={loading}
                disabled={success}
              >
                Register Recruiter Account
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2">
              <p>
                Already have a recruiter account?{' '}
                <Link
                  to="/recruiter/login"
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Sign in here
                </Link>
              </p>
              <p>
                Looking for jobs as a candidate?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-slate-700 hover:text-indigo-600"
                >
                  Candidate Signup
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RecruiterRegisterPage;
