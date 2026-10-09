import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { applicationApi } from '../../api/applicationApi';
import { jobApi } from '../../api/jobApi';
import { userApi } from '../../api/userApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ToastAlert from '../../components/common/ToastAlert';
import Modal from '../../components/common/Modal';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { APPLICATION_STATUS } from '../../utils/constants';
import { 
  FileCheck2, 
  ArrowLeft, 
  Download, 
  Mail, 
  Phone, 
  User, 
  Calendar, 
  Briefcase, 
  CheckCircle,
  Clock,
  Eye,
  Edit
} from 'lucide-react';

const AdminJobApplicationsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Status Change Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Cover Letter View Modal
  const [coverLetterModalOpen, setCoverLetterModalOpen] = useState(false);
  const [activeCoverLetter, setActiveCoverLetter] = useState({ candidateName: '', coverLetter: '' });

  const fetchJobAndApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const [jobData, appsData] = await Promise.all([
        jobApi.getJobById(jobId),
        applicationApi.getApplicationsByJob(jobId),
      ]);

      setJob(jobData);
      setApplications(Array.isArray(appsData) ? appsData : []);
    } catch (err) {
      setError(err?.message || 'Failed to load applications for this job');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJobAndApplications();
    }
  }, [jobId]);

  const handleOpenStatusModal = (app) => {
    setSelectedApplication(app);
    setNewStatus(app.status || 'APPLIED');
    setStatusModalOpen(true);
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApplication || !newStatus) return;

    try {
      setUpdatingStatus(true);
      setError(null);
      await applicationApi.adminUpdateStatus(selectedApplication.id, newStatus);
      setSuccess(`Application #${selectedApplication.id} status updated to ${newStatus}.`);
      setStatusModalOpen(false);
      fetchJobAndApplications();
    } catch (err) {
      setError(err?.message || 'Failed to update application status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDownloadResume = async (userId, candidateName) => {
    try {
      const blob = await userApi.downloadResume(userId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${candidateName.replace(/\s+/g, '_')}_resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.message || 'Failed to download candidate resume');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Job Applications Review">
        <div className="py-20 flex justify-center">
          <Spinner size="lg" text="Loading candidate applications..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Job Applications">
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              to="/admin/jobs"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Job Postings
            </Link>
            <h2 className="text-xl font-bold text-slate-900">
              Applications for: <span className="text-indigo-600">{job?.title || `Job #${jobId}`}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Employer: {job?.companyName || 'Unknown'} • Total Applicants: {applications.length}
            </p>
          </div>
        </div>

        {error && <ToastAlert type="error" message={error} onClose={() => setError(null)} />}
        {success && <ToastAlert type="success" message={success} onClose={() => setSuccess(null)} />}

        {/* Applications List */}
        {applications.length === 0 ? (
          <EmptyState
            title="No Applications Received"
            description="No candidates have applied for this job listing yet."
            icon={<FileCheck2 className="w-12 h-12 text-slate-300" />}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4">Candidate</th>
                    <th className="py-3.5 px-4">Applied Date</th>
                    <th className="py-3.5 px-4">Current Status</th>
                    <th className="py-3.5 px-4">Cover Letter / Resume</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                            {app.candidateName ? app.candidateName.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <Link
                              to={`/admin/users/${app.candidateId || app.userId}`}
                              className="font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                            >
                              {app.candidateName || 'Candidate'}
                            </Link>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" />
                              {app.candidateEmail || 'No email'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {formatDateTime(app.appliedDate)}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge status={app.status} />
                      </td>

                      <td className="py-3.5 px-4 text-xs space-y-1">
                        {app.coverLetter && (
                          <div>
                            <button
                              onClick={() => {
                                setActiveCoverLetter({
                                  candidateName: app.candidateName || 'Candidate',
                                  coverLetter: app.coverLetter,
                                });
                                setCoverLetterModalOpen(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View Cover Letter
                            </button>
                          </div>
                        )}
                        {(app.candidateId || app.userId) && (
                          <div>
                            <button
                              onClick={() => handleDownloadResume(app.candidateId || app.userId, app.candidateName || 'candidate')}
                              className="text-emerald-600 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download Resume
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<Edit className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenStatusModal(app)}
                        >
                          Change Status
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Change Status Modal */}
        <Modal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          title={`Update Status: Application #${selectedApplication?.id}`}
          size="sm"
        >
          <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
            <p className="text-xs text-slate-500">
              Set the administrative lifecycle status for candidate{' '}
              <span className="font-semibold text-slate-800">{selectedApplication?.candidateName}</span>.
            </p>

            <Select
              label="Application Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              required
              options={Object.values(APPLICATION_STATUS).map((status) => ({
                value: status,
                label: status.replace(/_/g, ' '),
              }))}
            />

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={updatingStatus}>
                Update Status
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Cover Letter Modal */}
        <Modal
          isOpen={coverLetterModalOpen}
          onClose={() => setCoverLetterModalOpen(false)}
          title={`Cover Letter: ${activeCoverLetter.candidateName}`}
          size="md"
        >
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-800 whitespace-pre-line leading-relaxed max-h-96 overflow-y-auto">
            {activeCoverLetter.coverLetter || 'No cover letter text provided.'}
          </div>
          <div className="pt-4 flex justify-end">
            <Button variant="primary" onClick={() => setCoverLetterModalOpen(false)}>
              Close
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default AdminJobApplicationsPage;
