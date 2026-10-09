import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { applicationApi } from '../../api/applicationApi';
import { APPLICATION_STATUS } from '../../utils/constants';
import { formatDate, formatSalary } from '../../utils/formatters';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ToastAlert from '../../components/common/ToastAlert';
import {
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  Award,
} from 'lucide-react';

export const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal actions
  const [selectedApp, setSelectedApp] = useState(null);
  const [confirmWithdrawOpen, setConfirmWithdrawOpen] = useState(false);
  const [confirmAcceptOpen, setConfirmAcceptOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await applicationApi.getMyApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to fetch application history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleWithdraw = async () => {
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      await applicationApi.withdrawApplication(selectedApp.id);
      setSuccess('Application successfully withdrawn.');
      setConfirmWithdrawOpen(false);
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      setError(err?.message || 'Cannot withdraw this application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptOffer = async () => {
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      await applicationApi.acceptOffer(selectedApp.id);
      setSuccess('Congratulations! You accepted the job offer.');
      setConfirmAcceptOpen(false);
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      if (err.status === 403 || err.response?.status === 403) {
        setError(
          'Offer Acceptance Notice: The backend Spring Boot SecurityConfig.java line 52 currently restricts PUT /applications/** to ADMIN authority only. Adding "/applications/*/accept-offer" alongside "/applications/*/withdraw" on line 51 (.hasAnyAuthority("USER", "ADMIN")) allows candidates to accept offers.'
        );
      } else {
        setError(err?.userMessage || err?.message || 'Failed to accept job offer.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const canWithdraw = (status) => {
    return (
      status !== APPLICATION_STATUS.SHORTLISTED &&
      status !== APPLICATION_STATUS.OFFERED &&
      status !== APPLICATION_STATUS.ACCEPTED &&
      status !== APPLICATION_STATUS.HIRED &&
      status !== APPLICATION_STATUS.WITHDRAWN
    );
  };

  return (
    <DashboardLayout
      title="My Job Applications"
      subtitle="Monitor your application lifecycle and respond to recruiter offers."
    >
      {error && <ToastAlert type="error" message={error} onClose={() => setError(null)} className="mb-6" />}
      {success && <ToastAlert type="success" message={success} onClose={() => setSuccess(null)} className="mb-6" />}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" text="Loading your applications..." />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-10 h-10 text-indigo-500" />}
          title="No applications submitted yet"
          description="Explore our curated job board and apply for opportunities matching your background."
          actionLabel="Browse Openings"
          onAction={() => (window.location.href = '/jobs')}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Job Details
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-sm">
                {applications.map((app) => {
                  const job = app.job;
                  const companyName = job?.company || job?.companyName || 'Company';
                  const isOffered = app.status === APPLICATION_STATUS.OFFERED;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <Link
                            to={`/jobs/${job?.id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-base"
                          >
                            {job?.title || 'Unknown Position'}
                          </Link>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {companyName}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {job?.location || 'Remote'}
                            </span>
                            <span className="font-medium text-slate-700">
                              {formatSalary(job?.salary)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(app.appliedDate)}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge status={app.status} />
                      </td>

                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        {isOffered && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => {
                              setSelectedApp(app);
                              setConfirmAcceptOpen(true);
                            }}
                            className="shadow-sm"
                          >
                            <Award className="w-3.5 h-3.5 mr-1" />
                            Accept Offer
                          </Button>
                        )}

                        {canWithdraw(app.status) && (
                          <Button
                            variant="dangerOutline"
                            size="sm"
                            onClick={() => {
                              setSelectedApp(app);
                              setConfirmWithdrawOpen(true);
                            }}
                          >
                            Withdraw
                          </Button>
                        )}

                        <Link to={`/jobs/${job?.id}`}>
                          <Button variant="ghost" size="sm">
                            View Job
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Withdraw confirmation dialog */}
      <ConfirmDialog
        isOpen={confirmWithdrawOpen}
        onClose={() => setConfirmWithdrawOpen(false)}
        onConfirm={handleWithdraw}
        title="Withdraw Application?"
        message={`Are you sure you want to withdraw your application for "${selectedApp?.job?.title}"? This action cannot be reversed.`}
        confirmText="Withdraw Application"
        variant="danger"
        loading={actionLoading}
      />

      {/* Accept Offer confirmation dialog */}
      <ConfirmDialog
        isOpen={confirmAcceptOpen}
        onClose={() => setConfirmAcceptOpen(false)}
        onConfirm={handleAcceptOffer}
        title="Accept Job Offer 🎉"
        message={`Congratulations! Are you ready to accept the job offer for "${selectedApp?.job?.title}"?`}
        confirmText="Yes, Accept Offer"
        variant="success"
        loading={actionLoading}
      />
    </DashboardLayout>
  );
};

export default MyApplicationsPage;
