import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import {
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  PlusCircle,
  Eye,
  Bookmark,
  TrendingUp,
  Percent,
} from 'lucide-react';

export const RecruiterDashboardPage = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await dashboardApi.getRecruiterDashboard();
        setDashboard(data);
      } catch (err) {
        setError(err.userMessage || 'Failed to load recruiter analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Recruiter Workspace" subtitle="Hiring metrics and performance">
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = dashboard || {};
  const jobStats = dashboard?.jobStatistics || [];

  return (
    <DashboardLayout
      title={`Hiring Dashboard: ${user?.company || user?.name || 'Recruiter'}`}
      subtitle="Track your open job pipelines, candidate engagement, and conversion rates."
      actions={
        <Link to="/recruiter/jobs/new">
          <Button variant="primary" size="md" className="flex items-center gap-1.5 shadow-sm">
            <PlusCircle className="w-4 h-4" />
            Post New Job
          </Button>
        </Link>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Top metrics summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Active Jobs</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.totalJobs || 0}</p>
          <Link to="/recruiter/jobs" className="text-[11px] font-semibold text-indigo-600 hover:underline mt-1 block">
            Manage jobs →
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Total Applicants</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-blue-700">{stats.totalApplications || 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Across all openings</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Shortlisted</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-purple-700">{stats.shortlisted || 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Qualified talent</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Under Review</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600">{stats.pending || 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Pending triage</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Hired</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">{stats.hired || 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Offers accepted 🎉</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Rejected</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-700">{stats.rejected || 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Archived</span>
        </div>
      </div>

      {/* Per-job conversion rate table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Job Performance & Conversion Rates
          </h3>
          <span className="text-xs text-slate-500">{jobStats.length} Postings</span>
        </div>

        {jobStats.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No job performance metrics available yet. Post a job opening to start collecting candidate telemetry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Job Title</th>
                  <th className="px-6 py-3 text-center">Views</th>
                  <th className="px-6 py-3 text-center">Saved</th>
                  <th className="px-6 py-3 text-center">Applicants</th>
                  <th className="px-6 py-3 text-center">Shortlisted</th>
                  <th className="px-6 py-3 text-center">Hired</th>
                  <th className="px-6 py-3 text-center">Conversion</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-sm">
                {jobStats.map((item) => (
                  <tr key={item.jobId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <Link to={`/jobs/${item.jobId}`} className="hover:text-indigo-600">
                        {item.jobTitle}
                      </Link>
                    </td>

                    <td className="px-6 py-4 text-center text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {item.views || 0}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                        {item.savedCount || 0}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center font-bold text-indigo-700">
                      {item.applications || 0}
                    </td>

                    <td className="px-6 py-4 text-center font-semibold text-purple-700">
                      {item.shortlisted || 0}
                    </td>

                    <td className="px-6 py-4 text-center font-bold text-emerald-700">
                      {item.hired || 0}
                    </td>

                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <Percent className="w-3 h-3 text-indigo-500" />
                        {item.conversionRate ? item.conversionRate.toFixed(1) : '0.0'}%
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link to={`/recruiter/jobs/${item.jobId}/applicants`}>
                        <Button variant="outline" size="sm">
                          Review Applicants ({item.applications || 0})
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RecruiterDashboardPage;
