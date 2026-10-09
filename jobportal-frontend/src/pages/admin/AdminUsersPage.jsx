import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ToastAlert from '../../components/common/ToastAlert';
import EmptyState from '../../components/common/EmptyState';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck,
  Building2,
  FileText
} from 'lucide-react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' or 'EDIT'
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    skill: 'General',
    company: '',
    phone: '',
    location: '',
    bio: '',
    companyName: '',
    companyWebsite: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirm Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.userMessage || err?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('CREATE');
    setSelectedUserId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'USER',
      skill: 'General',
      company: '',
      phone: '',
      location: '',
      bio: '',
      companyName: '',
      companyWebsite: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setModalMode('EDIT');
    setSelectedUserId(user.id);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // Leave blank unless updating
      role: user.role || 'USER',
      skill: user.skill || 'General',
      company: user.company || '',
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      companyName: user.companyName || '',
      companyWebsite: user.companyWebsite || '',
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setSubmitting(true);
      if (modalMode === 'CREATE') {
        if (!formData.password) {
          setError('Password is required for creating a new user');
          setSubmitting(false);
          return;
        }
        await userApi.createUser(formData);
        setSuccess(`User "${formData.name}" created successfully!`);
      } else {
        // Edit mode
        const updatePayload = { ...formData };
        if (!updatePayload.password) {
          delete updatePayload.password;
        }
        await userApi.updateUser(selectedUserId, updatePayload);
        setSuccess(`User "${formData.name}" updated successfully!`);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err?.message || `Failed to ${modalMode === 'CREATE' ? 'create' : 'update'} user`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      setDeleting(true);
      setError(null);
      await userApi.deleteUser(userToDelete.id);
      setSuccess(`User "${userToDelete.name}" deleted successfully.`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      setError(err?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
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
      setError(err?.message || 'Failed to download resume or resume not found');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.companyName || '').toLowerCase().includes(term) ||
      (u.location || '').toLowerCase().includes(term);
    return matchesRole && matchesSearch;
  });

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Registered Accounts</h2>
            <p className="text-sm text-slate-500">View, create, edit, and manage candidate and recruiter profiles</p>
          </div>
          <Button
            variant="primary"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={handleOpenCreateModal}
          >
            Create New User
          </Button>
        </div>

        {error && <ToastAlert type="error" message={error} onClose={() => setError(null)} />}
        {success && <ToastAlert type="success" message={success} onClose={() => setSuccess(null)} />}

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              aria-label="Filter by account role"
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="ALL">All Roles ({users.length})</option>
              <option value="USER">Candidates ({users.filter(u => u.role === 'USER').length})</option>
              <option value="RECRUITER">Recruiters ({users.filter(u => u.role === 'RECRUITER').length})</option>
              <option value="ADMIN">Admins ({users.filter(u => u.role === 'ADMIN').length})</option>
            </select>
          </div>
        </div>

        {/* Users Table / Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" text="Loading users..." />
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title="No Users Found"
            description={
              searchTerm || roleFilter !== 'ALL'
                ? 'No users match your search and filter criteria.'
                : 'No users registered in the system yet.'
            }
            icon={<Users className="w-12 h-12 text-slate-300" />}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Contact & Location</th>
                    <th className="py-3.5 px-4">Company / Resume</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <Link
                              to={`/admin/users/${user.id}`}
                              className="font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                            >
                              {user.name}
                            </Link>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : user.role === 'RECRUITER'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 space-y-1">
                        {user.phone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{user.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No phone</span>
                        )}
                        {user.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{user.location}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        {user.role === 'RECRUITER' && user.companyName ? (
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{user.companyName}</span>
                          </div>
                        ) : user.role === 'USER' && user.resumePath ? (
                          <button
                            onClick={() => handleDownloadResume(user.id, user.name)}
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Resume PDF
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/users/${user.id}`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View User Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setUserToDelete(user);
                              setDeleteDialogOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete User"
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
          </div>
        )}

        {/* Create / Edit User Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalMode === 'CREATE' ? 'Create New User Account' : 'Edit User Profile'}
          size="lg"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                placeholder="John Doe"
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                required
                disabled={modalMode === 'EDIT'}
                placeholder="user@example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={modalMode === 'CREATE' ? 'Password' : 'New Password (Optional)'}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleFormChange}
                required={modalMode === 'CREATE'}
                placeholder="••••••••"
                helperText={modalMode === 'EDIT' ? 'Leave blank to retain existing password' : ''}
              />

              <Select
                label="User Role"
                name="role"
                value={formData.role}
                onChange={handleFormChange}
                required
                options={[
                  { value: 'USER', label: 'Candidate (USER)' },
                  { value: 'RECRUITER', label: 'Recruiter (RECRUITER)' },
                  { value: 'ADMIN', label: 'Administrator (ADMIN)' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Primary Skills"
                name="skill"
                value={formData.skill}
                onChange={handleFormChange}
                placeholder="e.g. Java, Spring Boot, React"
                required
              />

              <Input
                label="Company (For Recruiters)"
                name="company"
                value={formData.company}
                onChange={handleFormChange}
                placeholder="e.g. Google, Microsoft, Tech Corp"
              />
            </div>

            {formData.role === 'RECRUITER' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <Input
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleFormChange}
                  placeholder="Acme Corp"
                />

                <Input
                  label="Company Website"
                  name="companyWebsite"
                  type="url"
                  value={formData.companyWebsite}
                  onChange={handleFormChange}
                  placeholder="https://acme.com"
                />
              </div>
            )}

            <Input
              label="Bio / Short Description"
              name="bio"
              value={formData.bio}
              onChange={handleFormChange}
              placeholder="Short bio or summary..."
            />

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitting}
              >
                {modalMode === 'CREATE' ? 'Create Account' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete User Account"
          message={`Are you sure you want to delete user "${userToDelete?.name}" (${userToDelete?.email})? This action will permanently remove the user and cannot be undone.`}
          confirmText="Delete User"
          confirmVariant="danger"
          loading={deleting}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminUsersPage;
