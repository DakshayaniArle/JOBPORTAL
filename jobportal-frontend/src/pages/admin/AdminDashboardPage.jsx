import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { userApi } from '../../api/userApi';
import { jobApi } from '../../api/jobApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import ToastAlert from '../../components/common/ToastAlert';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import { 
  Users, 
  Briefcase, 
  FileCheck2, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  PlusCircle, 
  Settings,
  Eye
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [metricsRes, usersRes, jobsRes] = await Promise.allSettled([
          dashboardApi.getAdminDashboard(),
          userApi.getAllUsers(),
          jobApi.getJobs(0, 5),
        ]);

        if (metricsRes.status === 'fulfilled') {
          setMetrics(metricsRes.value);
        }
        if (usersRes.status === 'fulfilled') {
          const allUsers = Array.isArray(usersRes.value) ? usersRes.value : [];
          setRecentUsers(allUsers.slice(0, 5));
        }
        if (jobsRes.status === 'fulfilled') {
          const jobsData = jobsRes.value;
          setRecentJobs(jobsData?.content || (Array.isArray(jobsData) ? jobsData.slice(0, 5) : []));
        }
      } catch (err) {
        setError(err?.message || 'Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Admin Control Center">
        <div className="py-20 flex justify-center">
          <Spinner size="lg" text="Loading platform analytics..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="System Administration">
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Platform Administrator
            </div>
            <h2 className="text-2xl font-black">Job Portal Overview & Metrics</h2>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Monitor total registered accounts, job postings, candidate applications, and system integrity.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/users"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow transition-colors"
            >
              Manage Users
            </Link>
            <Link
              to="/admin/jobs"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl backdrop-blur transition-colors"
            >
              Manage Jobs
            </Link>
          </div>
        </div>

        {error && <ToastAlert type="error" message={error} onClose={() => setError(null)} />}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  {metrics?.totalUsers ?? '0'}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Candidates, Recruiters & Admins</span>
              <Link to="/admin/users" className="text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Job Listings</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  {metrics?.totalJobs ?? '0'}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Active & Closed Listings</span>
              <Link to="/admin/jobs" className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Applications</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  {metrics?.totalApplications ?? '0'}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileCheck2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Applications Across All Jobs</span>
              <Link to="/admin/jobs" className="text-emerald-600 font-semibold hover:underline flex items-center gap-1">
                Inspect <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Dual Panels: Recent Users & Recent Jobs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Recently Registered Users</h3>
              </div>
              <Link to="/admin/users" className="text-xs font-semibold text-indigo-600 hover:underline">
                View All Users
              </Link>
            </div>

            {recentUsers.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">No user accounts found.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentUsers.map((user) => (
                  <div key={user.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <Link to={`/admin/users/${user.id}`} className="text-sm font-semibold text-slate-900 hover:text-indigo-600">
                          {user.name}
                        </Link>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : user.role === 'RECRUITER'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {user.role}
                      </span>
                      <Link to={`/admin/users/${user.id}`} className="p-1 text-slate-400 hover:text-slate-600">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Jobs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Latest Job Postings</h3>
              </div>
              <Link to="/admin/jobs" className="text-xs font-semibold text-indigo-600 hover:underline">
                View All Jobs
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">No job listings found.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentJobs.map((job) => (
                  <div key={job.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link to={`/jobs/${job.id}`} className="text-sm font-semibold text-slate-900 hover:text-indigo-600 line-clamp-1">
                        {job.title}
                      </Link>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{job.companyName || 'Company'}</span>
                        <span>•</span>
                        <span>{formatDate(job.postedDate)}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        job.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {job.active ? 'Active' : 'Closed'}
                      </span>
                      <Link
                        to={`/admin/jobs/${job.id}/applications`}
                        className="text-xs text-indigo-600 hover:underline font-medium ml-1"
                      >
                        Applicants
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
