import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { applicationApi } from '../../api/applicationApi';
import { userApi } from '../../api/userApi';
import { APPLICATION_STATUS } from '../../utils/constants';
import { formatDate, parseSkills } from '../../utils/formatters';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ToastAlert from '../../components/common/ToastAlert';
import {
  Users,
  Calendar,
  Mail,
  FileText,
  CheckCircle2,
  XCircle,
  Award,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Download,
} from 'lucide-react';

export const JobApplicantsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumeNotice, setResumeNotice] = useState(null);
  const [downloadingResumeId, setDownloadingResumeId] = useState(null);

  // Status update modal / confirmation
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [targetApplication, setTargetApplication] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Tab filter
  const [selectedTab, setSelectedTab] = useState('ALL');

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await applicationApi.getApplicantsForRecruiterJob(jobId);
      setApplicants(data || []);
    } catch (err) {
      setError(err.userMessage || 'Failed to load applicants for this job.');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const handleStatusChangeRequest = (app, status) => {
    setTargetApplication(app);
    setNewStatus(status);
    setStatusConfirmOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!targetApplication || !newStatus) return;

    setUpdating(true);
    try {
      await applicationApi.recruiterUpdateStatus(targetApplication.id, newStatus);
      setStatusConfirmOpen(false);
      setTargetApplication(null);
      setNewStatus(null);
      fetchApplicants();
    } catch (err) {
      alert(err.userMessage || 'Failed to update candidate status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadResume = async (candidate) => {
    if (!candidate?.id) return;
    setDownloadingResumeId(candidate.id);
    setResumeNotice(null);
    try {
      const response = await userApi.downloadResume(candidate.id);
      const blob = new Blob([response.data || response]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', candidate.resumeName || `Resume_${candidate.name || 'candidate'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (err.status === 403 || err.response?.status === 403) {
        setResumeNotice(
          `Resume Access Notice: Candidate has uploaded "${candidate.resumeName || 'Resume.pdf'}". Note that the backend Spring Boot SecurityConfig.java line 56 currently restricts GET /users/resume/** to ADMIN authority (.hasAuthority("ADMIN")). In the backend, adding RECRUITER to line 56 (.hasAnyAuthority("ADMIN", "RECRUITER")) allows recruiters to download candidate resumes.`
        );
      } else {
        alert(err.userMessage || 'Failed to download candidate resume.');
      }
    } finally {
      setDownloadingResumeId(null);
    }
  };

  const tabs = [
    { id: 'ALL', label: 'All Applicants' },
    { id: APPLICATION_STATUS.APPLIED, label: 'Under Review' },
    { id: APPLICATION_STATUS.SHORTLISTED, label: 'Shortlisted' },
    { id: APPLICATION_STATUS.INTERVIEW_SCHEDULED, label: 'Interviewing' },
    { id: APPLICATION_STATUS.OFFERED, label: 'Offered' },
    { id: APPLICATION_STATUS.ACCEPTED, label: 'Offer Accepted' },
    { id: APPLICATION_STATUS.HIRED, label: 'Hired' },
    { id: APPLICATION_STATUS.REJECTED, label: 'Rejected' },
  ];

  const filteredApplicants = applicants.filter((a) => {
    if (selectedTab === 'ALL') return true;
    return a.status === selectedTab;
  });

  const jobTitle = applicants[0]?.job?.title || `Job #${jobId}`;

  return (
    <DashboardLayout
      title={`Applicants for: ${jobTitle}`}
      subtitle="Review candidate qualifications, skills, and progress applicants through hiring stages."
      actions={
        <Link to="/recruiter/jobs">
          <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Jobs
          </Button>
        </Link>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {resumeNotice && (
        <ToastAlert
          type="warning"
          message={resumeNotice}
          onClose={() => setResumeNotice(null)}
          className="mb-6"
        />
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-6 border-b border-slate-200">
        {tabs.map((tab) => {
          const count =
            tab.id === 'ALL'
              ? applicants.length
              : applicants.filter((a) => a.status === tab.id).length;

          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      ) : filteredApplicants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates in this stage"
          description="Candidates applying to this position or matching this status tab will appear here."
        />
      ) : (
        <div className="space-y-4">
          {filteredApplicants.map((app) => {
            const candidate = app.user;
            const candidateSkills = parseSkills(candidate?.skill);

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Candidate Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-slate-900">
                      {candidate?.name || 'Applicant'}
                    </h3>
                    <Badge status={app.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {candidate?.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Applied: {formatDate(app.appliedDate)}
                    </span>
                    {candidate?.resumeName ? (
                      <button
                        type="button"
                        onClick={() => handleDownloadResume(candidate)}
                        disabled={downloadingResumeId === candidate.id}
                        title="Click to download applicant resume"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors cursor-pointer border border-indigo-200"
                      >
                        {downloadingResumeId === candidate.id ? (
                          <Spinner size="xs" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-indigo-600" />
                        )}
                        <span>Resume: {candidate.resumeName}</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 italic">No resume attached</span>
                    )}
                  </div>

                  {/* Skills */}
                  {candidateSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {candidateSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* State Machine Transition Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                  {/* From APPLIED -> Shortlist / Reject */}
                  {app.status === APPLICATION_STATUS.APPLIED && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          handleStatusChangeRequest(app, APPLICATION_STATUS.SHORTLISTED)
                        }
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        Shortlist
                      </Button>
                      <Button
                        variant="dangerOutline"
                        size="sm"
                        onClick={() =>
                          handleStatusChangeRequest(app, APPLICATION_STATUS.REJECTED)
                        }
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {/* From SHORTLISTED -> Schedule Interview / Reject */}
                  {app.status === APPLICATION_STATUS.SHORTLISTED && (
                    <>
                      <Link to={`/recruiter/schedule-interview/${app.id}?candidateName=${encodeURIComponent(candidate?.name || '')}&jobTitle=${encodeURIComponent(jobTitle || '')}`}>
                        <Button variant="primary" size="sm">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          Schedule Interview
                        </Button>
                      </Link>
                      <Button
                        variant="dangerOutline"
                        size="sm"
                        onClick={() =>
                          handleStatusChangeRequest(app, APPLICATION_STATUS.REJECTED)
                        }
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {/* From INTERVIEW_SCHEDULED -> Make Offer / Reject */}
                  {app.status === APPLICATION_STATUS.INTERVIEW_SCHEDULED && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() =>
                          handleStatusChangeRequest(app, APPLICATION_STATUS.OFFERED)
                        }
                      >
                        <Award className="w-3.5 h-3.5 mr-1" />
                        Make Offer
                      </Button>
                      <Button
                        variant="dangerOutline"
                        size="sm"
                        onClick={() =>
                          handleStatusChangeRequest(app, APPLICATION_STATUS.REJECTED)
                        }
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {/* From OFFERED -> Awaiting candidate acceptance */}
                  {app.status === APPLICATION_STATUS.OFFERED && (
                    <>
                      <span className="text-xs text-amber-700 font-medium px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                        Awaiting Candidate Acceptance
                      </span>
                      <Button
                        variant="dangerOutline"
                        size="sm"
                        onClick={() =>
                          handleStatusChangeRequest(app, APPLICATION_STATUS.REJECTED)
                        }
                      >
                        Cancel Offer
                      </Button>
                    </>
                  )}

                  {/* From ACCEPTED -> Mark Hired */}
                  {app.status === APPLICATION_STATUS.ACCEPTED && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() =>
                        handleStatusChangeRequest(app, APPLICATION_STATUS.HIRED)
                      }
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Mark as Hired 🎉
                    </Button>
                  )}

                  {app.status === APPLICATION_STATUS.HIRED && (
                    <span className="text-xs font-bold text-emerald-700 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                      Successfully Hired
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for status updates */}
      <ConfirmDialog
        isOpen={statusConfirmOpen}
        onClose={() => setStatusConfirmOpen(false)}
        onConfirm={handleConfirmStatusChange}
        title="Update Candidate Status"
        message={`Are you sure you want to update ${targetApplication?.user?.name}'s application status to "${newStatus}"? This will trigger automated email & in-app notifications.`}
        confirmText={`Set to ${newStatus}`}
        variant={newStatus === APPLICATION_STATUS.REJECTED ? 'danger' : 'primary'}
        isLoading={updating}
      />
    </DashboardLayout>
  );
};

export default JobApplicantsPage;
