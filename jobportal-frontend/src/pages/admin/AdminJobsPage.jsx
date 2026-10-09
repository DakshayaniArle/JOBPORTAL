import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobApi } from '../../api/jobApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ToastAlert from '../../components/common/ToastAlert';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatSalary } from '../../utils/formatters';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Users, 
  Lock, 
  Unlock, 
  Calendar, 
  ExternalLink,
  MapPin,
  Building2,
  Clock
} from 'lucide-react';

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit Job Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', description: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  // Extend Expiry Modal State
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [extending, setExtending] = useState(false);

  // Delete Confirm Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = async (page = 0) => {
    try {
      setLoading(true);
      setError(null);
      const data = await jobApi.getJobs(page, 10);
      if (data && data.content) {
        setJobs(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || data.content.length);
        setCurrentPage(data.number || 0);
      } else if (Array.isArray(data)) {
        setJobs(data);
        setTotalPages(1);
        setTotalElements(data.length);
        setCurrentPage(0);
      } else {
        setJobs([]);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage]);

  const handleOpenEditModal = (job) => {
    setSelectedJob(job);
    setEditFormData({
      title: job.title || '',
      description: job.description || '',
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    try {
      setSavingEdit(true);
      setError(null);
      const updatePayload = {
        ...selectedJob,
        title: editFormData.title.trim(),
        description: editFormData.description.trim(),
      };
      await jobApi.updateJob(selectedJob.id, updatePayload);
      setSuccess(`Job "${editFormData.title}" updated successfully.`);
      setEditModalOpen(false);
      fetchJobs(currentPage);
    } catch (err) {
      setError(err?.userMessage || err?.message || 'Failed to update job');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = async (job) => {
    try {
      setError(null);
      if (job.active) {
        await jobApi.closeJob(job.id);
        setSuccess(`Job "${job.title}" closed.`);
      } else {
        await jobApi.reopenJob(job.id);
        setSuccess(`Job "${job.title}" reopened.`);
      }
      fetchJobs(currentPage);
    } catch (err) {
      setError(err?.message || 'Failed to toggle job active status');
    }
  };

  const handleOpenExtendModal = (job) => {
    setSelectedJob(job);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    setNewExpiryDate(tomorrow.toISOString().split('T')[0]);
    setExtendModalOpen(true);
  };

  const handleExtendSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob || !newExpiryDate) return;
    try {
      setExtending(true);
      setError(null);
      await jobApi.extendExpiry(selectedJob.id, newExpiryDate);
      setSuccess(`Expiry date extended to ${formatDate(newExpiryDate)}`);
      setExtendModalOpen(false);
      fetchJobs(currentPage);
    } catch (err) {
      setError(err?.message || 'Failed to extend job expiry date');
    } finally {
      setExtending(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    try {
      setDeleting(true);
      setError(null);
      await jobApi.deleteJob(jobToDelete.id);
      setSuccess(`Job "${jobToDelete.title}" deleted.`);
      setDeleteDialogOpen(false);
      setJobToDelete(null);
      fetchJobs(currentPage);
    } catch (err) {
      setError(err?.message || 'Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesStatus = 
      statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && j.active) || 
      (statusFilter === 'CLOSED' && !j.active);
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (j.title || '').toLowerCase().includes(term) ||
      (j.companyName || '').toLowerCase().includes(term) ||
      (j.location || '').toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardLayout title="Job Listings Administration">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">All Job Postings</h2>
            <p className="text-sm text-slate-500">Inspect, modify, close, reopen, or delete any job listing on the platform</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Total Listings:</span>
            <span className="font-bold text-slate-900">{totalElements}</span>
          </div>
        </div>

        {error && <ToastAlert type="error" message={error} onClose={() => setError(null)} />}
        {success && <ToastAlert type="success" message={success} onClose={() => setSuccess(null)} />}

        {/* Filter / Search bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by job status"
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="CLOSED">Closed Only</option>
            </select>
          </div>
        </div>

        {/* Jobs Table */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" text="Loading jobs catalog..." />
          </div>
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            title="No Jobs Found"
            description="No job postings matched your current search filters."
            icon={<Briefcase className="w-12 h-12 text-slate-300" />}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4">Job Title & Company</th>
                    <th className="py-3.5 px-4">Location & Type</th>
                    <th className="py-3.5 px-4">Dates</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <Link
                            to={`/jobs/${job.id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                          >
                            {job.title}
                          </Link>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{job.companyName || 'Unknown Employer'}</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-semibold text-emerald-600">{formatSalary(job.salary)}</span>
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{job.location || 'Remote'}</span>
                        </div>
                        <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                          {job.jobType || 'FULL_TIME'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500 space-y-1">
                        <div>Posted: {formatDate(job.postedDate)}</div>
                        <div className="text-slate-400">Expires: {formatDate(job.expiryDate)}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          job.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {job.active ? 'Active' : 'Closed'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/jobs/${job.id}/applications`}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Inspect Job Applications"
                          >
                            <Users className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(job)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              job.active
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={job.active ? 'Close Job Listing' : 'Reopen Job Listing'}
                          >
                            {job.active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleOpenExtendModal(job)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Extend Expiry Date"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(job)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Title / Description"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setJobToDelete(job);
                              setDeleteDialogOpen(true);
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Job Permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => setCurrentPage(p)}
                />
              </div>
            )}
          </div>
        )}

        {/* Edit Title / Description Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Edit Job: ${selectedJob?.title}`}
          size="lg"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Input
              label="Job Title"
              value={editFormData.title}
              onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <Textarea
              label="Job Description"
              rows={6}
              value={editFormData.description}
              onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
            <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={savingEdit}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        {/* Extend Expiry Modal */}
        <Modal
          isOpen={extendModalOpen}
          onClose={() => setExtendModalOpen(false)}
          title="Extend Job Expiry Date"
          size="sm"
        >
          <form onSubmit={handleExtendSubmit} className="space-y-4">
            <p className="text-xs text-slate-500">
              Select a new expiry deadline for <span className="font-semibold text-slate-800">{selectedJob?.title}</span>.
            </p>
            <Input
              label="New Expiry Date"
              type="date"
              value={newExpiryDate}
              onChange={(e) => setNewExpiryDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
            />
            <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setExtendModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={extending}>
                Update Expiry
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Job Listing"
          message={`Are you sure you want to delete "${jobToDelete?.title}"? All associated candidate applications may also be removed.`}
          confirmText="Delete Job"
          confirmVariant="danger"
          loading={deleting}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminJobsPage;
