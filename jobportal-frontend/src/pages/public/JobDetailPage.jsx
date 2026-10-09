import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobApi } from '../../api/jobApi';
import { applicationApi } from '../../api/applicationApi';
import { savedJobApi } from '../../api/savedJobApi';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import { formatSalary, formatDate, parseSkills } from '../../utils/formatters';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import {
  Building2,
  MapPin,
  Banknote,
  Clock,
  Calendar,
  Eye,
  Bookmark,
  Send,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  Edit,
  Users,
} from 'lucide-react';

export const JobDetailPage = () => {
  const { jobId, id: paramId } = useParams();
  const id = jobId || paramId;
  const navigate = useNavigate();
  const { user, role, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Application & Bookmark status
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Load Job details and user states
  const fetchJobData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data = null;

      // Rule: Views of the job should only be counted when users/candidates view the job,
      // not including recruiter views. Recruiter views their own job via my-jobs without incrementing view counter.
      if (isAuthenticated && role === ROLES.RECRUITER) {
        try {
          const myJobs = await jobApi.getMyJobs();
          data = (myJobs || []).find((j) => j.id === Number(id));
        } catch {
          // fallback to getJobById if not in recruiter list
        }
      }

      if (!data) {
        data = await jobApi.getJobById(id);
      }
      setJob(data);

      if (isAuthenticated && role === ROLES.USER) {
        // Check if user already applied or saved this job
        const [applications, savedList] = await Promise.allSettled([
          applicationApi.getMyApplications(),
          savedJobApi.getMySavedJobs(),
        ]);

        if (applications.status === 'fulfilled') {
          const applied = applications.value.some((app) => app.job?.id === Number(id));
          setHasApplied(applied);
        }

        if (savedList.status === 'fulfilled') {
          const saved = savedList.value.some((s) => s.job?.id === Number(id));
          setIsSaved(saved);
        }
      }
    } catch (err) {
      setError(err.userMessage || 'Job not found or failed to load details.');
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated, role]);

  useEffect(() => {
    fetchJobData();
  }, [fetchJobData]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }
    if (role !== ROLES.USER) {
      alert('Only registered candidates can submit job applications.');
      return;
    }

    setApplying(true);
    try {
      await applicationApi.applyJob(job.id);
      setHasApplied(true);
      setShowSuccessModal(true);
    } catch (err) {
      alert(err.userMessage || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (role !== ROLES.USER) return;

    setSaving(true);
    try {
      if (isSaved) {
        await savedJobApi.removeSavedJob(job.id);
        setIsSaved(false);
      } else {
        await savedJobApi.saveJob(job.id);
        setIsSaved(true);
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to update saved job status.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center flex-1">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Job Not Found</h2>
          <p className="text-slate-500 mb-6">{error || 'This job opening does not exist or has been removed.'}</p>
          <Link to="/jobs">
            <Button variant="primary">Browse Open Jobs</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const skills = parseSkills(job.requiredSkills);
  const isClosed = job.active === false;
  const isExpired = job.expiryDate && new Date(job.expiryDate) < new Date();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Breadcrumb Back link */}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all jobs
        </Link>

        {/* Warning Banner if Inactive or Expired */}
        {(isClosed || isExpired) && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold">This job is currently not accepting applications.</p>
              <p className="text-xs text-amber-700">
                {isClosed ? 'The recruiter has marked this opening as closed.' : 'The deadline for this job posting has expired.'}
              </p>
            </div>
          </div>
        )}

        {/* Main Job Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-sm font-semibold text-indigo-600 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  {job.company}
                </span>
                <Badge jobType={job.jobType} size="sm" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                {job.title}
              </h1>

              {/* Highlights row */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Banknote className="w-4 h-4 text-emerald-500" />
                  {formatSalary(job.salary)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {job.experienceLevel || (job.experience ? `${job.experience} years experience` : 'Freshers welcome')}
                </span>
                {job.views !== undefined && (
                  <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Eye className="w-3.5 h-3.5" />
                    {job.views} total views
                  </span>
                )}
              </div>
            </div>

            {/* Application / Recruiter action panel */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              {role === ROLES.RECRUITER && (job.recruiter?.id === user?.id || job.recruiter?.email === user?.email) ? (
                <div className="flex items-center gap-2">
                  <Link to={`/recruiter/jobs/${job.id}/applicants`}>
                    <Button variant="outline" size="lg" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Applicants
                    </Button>
                  </Link>
                  <Link to={`/recruiter/jobs/${job.id}/edit`}>
                    <Button variant="primary" size="lg" className="flex items-center gap-2 shadow-md">
                      <Edit className="w-4 h-4" />
                      Edit Job
                    </Button>
                  </Link>
                </div>
              ) : role === ROLES.ADMIN ? (
                <div className="flex items-center gap-2">
                  <Link to={`/admin/jobs/${job.id}/applications`}>
                    <Button variant="outline" size="lg" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Applications
                    </Button>
                  </Link>
                  <Link to="/admin/jobs">
                    <Button variant="primary" size="lg" className="flex items-center gap-2 shadow-md">
                      <Edit className="w-4 h-4" />
                      Admin Edit
                    </Button>
                  </Link>
                </div>
              ) : role === ROLES.RECRUITER ? (
                <span className="text-xs text-slate-500 font-medium px-3 py-2 bg-slate-100 rounded-lg">
                  Recruiter View
                </span>
              ) : (
                <>
                  {role === ROLES.USER && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleToggleSave}
                      isLoading={saving}
                      className="flex items-center gap-2"
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600' : ''}`} />
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                  )}

                  {hasApplied ? (
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-semibold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Application Submitted
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      disabled={isClosed || isExpired}
                      isLoading={applying}
                      onClick={handleApply}
                      className="flex items-center gap-2 shadow-md"
                    >
                      <Send className="w-4 h-4" />
                      Apply Now
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Job Description & Required Skills */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Job Overview & Description
              </h2>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {job.description || 'No detailed description provided for this opening.'}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Required Skills & Qualifications
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((sk) => (
                  <span
                    key={sk}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Company & Summary Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Job Information
              </h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-slate-400">Company</dt>
                  <dd className="font-semibold text-slate-800">{job.company}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Employment Type</dt>
                  <dd className="font-semibold text-slate-800">{job.jobType}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Posted Date</dt>
                  <dd className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(job.postedDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Application Deadline</dt>
                  <dd className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(job.expiryDate)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Recruiter / Safety Card */}
            <div className="bg-indigo-50/60 rounded-2xl border border-indigo-100 p-6">
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">
                Candidate Protection
              </h4>
              <p className="text-xs text-indigo-700/80 leading-relaxed">
                Job applications submitted through this platform are sent directly to verified hiring managers. Never pay any fees for job interviews.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Application Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Application Submitted 🎉"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            You applied for {job.title}!
          </h3>
          <p className="text-sm text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
            Your profile and resume have been forwarded to {job.company}. You can monitor progress and scheduled interviews from your applications dashboard.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => setShowSuccessModal(false)}>
              Continue Browsing
            </Button>
            <Link to="/candidate/applications">
              <Button variant="primary">View My Applications</Button>
            </Link>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};

export default JobDetailPage;
