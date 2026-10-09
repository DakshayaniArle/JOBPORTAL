import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { jobApi } from '../../api/jobApi';
import { formatDate, formatSalary } from '../../utils/formatters';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import {
  Briefcase,
  Users,
  PlusCircle,
  Clock,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  MoreVertical,
  Edit,
} from 'lucide-react';

export const MyJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extend Expiry Modal state
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [extendDays, setExtendDays] = useState(15);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit Job Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    experience: '',
    experienceLevel: '',
    requiredSkills: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchMyJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobApi.getMyJobs();
      setJobs(data || []);
    } catch (err) {
      setError(err.userMessage || 'Failed to load your posted jobs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyJobs();
  }, [fetchMyJobs]);

  const handleCloseJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to close this job? Candidates will no longer be able to apply.')) {
      return;
    }
    try {
      await jobApi.closeJob(jobId);
      fetchMyJobs();
    } catch (err) {
      alert(err.userMessage || 'Failed to close job.');
    }
  };

  const handleReopenJob = async (jobId) => {
    try {
      await jobApi.reopenJob(jobId);
      fetchMyJobs();
    } catch (err) {
      alert(err.userMessage || 'Failed to reopen job.');
    }
  };

  const handleExtendSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    setActionLoading(true);
    try {
      await jobApi.extendExpiry(selectedJob.id, parseInt(extendDays, 10));
      setExtendModalOpen(false);
      setSelectedJob(null);
      fetchMyJobs();
    } catch (err) {
      alert(err.userMessage || 'Failed to extend job expiry.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (job) => {
    setEditJob(job);
    setEditFormData({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      salary: job.salary || '',
      experience: job.experience !== null && job.experience !== undefined ? String(job.experience) : '',
      experienceLevel: job.experienceLevel || '',
      requiredSkills: job.requiredSkills || '',
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editJob) return;

    setSavingEdit(true);
    try {
      const numExp = editFormData.experience !== '' ? parseInt(editFormData.experience, 10) : null;
      let expLevel = editFormData.experienceLevel?.trim() || '';
      if (!expLevel && numExp !== null) {
        expLevel = numExp === 0 ? 'Fresher (0y)' : `${numExp}+ Years`;
      }

      await jobApi.updateJob(editJob.id, {
        title: editFormData.title.trim(),
        description: editFormData.description?.trim(),
        location: editFormData.location.trim(),
        salary: editFormData.salary ? parseFloat(editFormData.salary) : null,
        experience: numExp,
        experienceLevel: expLevel,
        requiredSkills: editFormData.requiredSkills.trim(),
      });
      setEditModalOpen(false);
      setEditJob(null);
      fetchMyJobs();
    } catch (err) {
      alert(err.userMessage || 'Failed to update job.');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <DashboardLayout
      title="My Posted Jobs"
      subtitle="Manage your vacancies, adjust deadlines, and access candidate applicants."
      actions={
        <Link to="/recruiter/post-job">
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

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="You haven't posted any jobs yet"
          description="Start building your team by publishing your first job vacancy."
          actionLabel="Create Job Opening"
          onAction={() => (window.location.href = '/recruiter/post-job')}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 text-left">Job Details</th>
                  <th className="px-6 py-3.5 text-left">Type & Salary</th>
                  <th className="px-6 py-3.5 text-left">Posted / Expiry</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-sm">
                {jobs.map((job) => {
                  const isClosed = job.active === false;

                  return (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <Link
                            to={`/jobs/${job.id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-base"
                          >
                            {job.title}
                          </Link>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span>{job.location}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              {job.views || 0} views
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        <div className="space-y-1">
                          <Badge jobType={job.jobType} size="sm" />
                          <p className="font-semibold text-slate-800">
                            {formatSalary(job.salary)}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                        <div className="space-y-1">
                          <p className="flex items-center gap-1">
                            <span className="text-slate-400">Posted:</span>
                            {formatDate(job.postedDate)}
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="text-slate-400">Expires:</span>
                            <span className={isClosed ? 'line-through text-slate-400' : 'font-medium'}>
                              {formatDate(job.expiryDate)}
                            </span>
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {isClosed ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Closed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                        <Link to={`/recruiter/jobs/${job.id}/applicants`}>
                          <Button variant="primary" size="sm" className="shadow-xs">
                            <Users className="w-3.5 h-3.5 mr-1" />
                            Applicants
                          </Button>
                        </Link>

                        <Link to={`/recruiter/jobs/${job.id}/edit`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="inline-flex items-center gap-1 shadow-xs"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                        </Link>

                        {isClosed ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleReopenJob(job.id)}
                          >
                            Reopen (+30d)
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedJob(job);
                                setExtendModalOpen(true);
                              }}
                            >
                              Extend
                            </Button>
                            <Button
                              variant="dangerOutline"
                              size="sm"
                              onClick={() => handleCloseJob(job.id)}
                            >
                              Close
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Extend Expiry Modal */}
      <Modal
        isOpen={extendModalOpen}
        onClose={() => setExtendModalOpen(false)}
        title={`Extend Deadline: ${selectedJob?.title}`}
      >
        <form onSubmit={handleExtendSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Current Expiry Date: <span className="font-semibold text-slate-800">{formatDate(selectedJob?.expiryDate)}</span>
          </p>

          <Input
            label="Additional Extension (Days)"
            id="extendDays"
            name="extendDays"
            type="number"
            min="1"
            max="180"
            value={extendDays}
            onChange={(e) => setExtendDays(e.target.value)}
            helperText="Adds these days to the current deadline."
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setExtendModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={actionLoading}>
              Extend Expiry Date
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Job Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Job: ${editJob?.title}`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Job Title"
            id="editTitle"
            value={editFormData.title}
            onChange={(e) => setEditFormData((prev) => ({ ...prev, title: e.target.value }))}
            required
          />

          <Input
            label="Location"
            id="editLocation"
            value={editFormData.location}
            onChange={(e) => setEditFormData((prev) => ({ ...prev, location: e.target.value }))}
            required
          />

          <Input
            label="Annual Salary (₹ INR)"
            id="editSalary"
            type="number"
            min="1000"
            value={editFormData.salary}
            onChange={(e) => setEditFormData((prev) => ({ ...prev, salary: e.target.value }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Required Experience (Years)"
              id="editExperience"
              type="number"
              min="0"
              max="40"
              value={editFormData.experience}
              onChange={(e) => setEditFormData((prev) => ({ ...prev, experience: e.target.value }))}
              placeholder="e.g. 0 for fresher, 2 for 2+y"
            />
            <Input
              label="Experience Level Description"
              id="editExperienceLevel"
              value={editFormData.experienceLevel}
              onChange={(e) => setEditFormData((prev) => ({ ...prev, experienceLevel: e.target.value }))}
              placeholder="e.g. Fresher, 2+ Years"
            />
          </div>

          <Input
            label="Required Skills (Comma-Separated)"
            id="editSkills"
            value={editFormData.requiredSkills}
            onChange={(e) => setEditFormData((prev) => ({ ...prev, requiredSkills: e.target.value }))}
            required
          />

          <Textarea
            label="Job Description"
            id="editDescription"
            rows={4}
            value={editFormData.description}
            onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={savingEdit}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default MyJobsPage;
