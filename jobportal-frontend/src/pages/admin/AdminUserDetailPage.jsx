import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import ToastAlert from '../../components/common/ToastAlert';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Globe, 
  FileText, 
  Download, 
  ArrowLeft, 
  CheckCircle, 
  Shield, 
  Calendar,
  Code
} from 'lucide-react';
import { parseSkills } from '../../utils/formatters';

const AdminUserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userApi.getUserById(userId);
        setUser(data);
      } catch (err) {
        setError(err?.message || 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const handleDownloadResume = async () => {
    try {
      setDownloading(true);
      const blob = await userApi.downloadResume(userId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${(user?.name || 'candidate').replace(/\s+/g, '_')}_resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.message || 'Failed to download candidate resume');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="User Details">
        <div className="py-20 flex justify-center">
          <Spinner size="lg" text="Loading user profile..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !user) {
    return (
      <DashboardLayout title="User Details">
        <div className="max-w-xl mx-auto py-12">
          <ToastAlert type="error" message={error || 'User not found'} className="mb-6" />
          <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/admin/users')}>
            Back to Users
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const skillsList = parseSkills(user.skills);

  return (
    <DashboardLayout title={`User: ${user.name}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/users"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to User Directory
          </Link>
          <span className="text-xs text-slate-400 font-mono">User ID: #{user.id}</span>
        </div>

        {/* User Hero Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-3xl border border-indigo-100 shadow-inner">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h2 className="text-2xl font-black text-slate-900">{user.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  user.role === 'ADMIN'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : user.role === 'RECRUITER'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {user.role}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 flex items-center justify-center md:justify-start gap-4">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}</span>
                {user.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {user.phone}</span>}
              </p>
            </div>
          </div>

          {user.role === 'USER' && user.resumePath && (
            <Button
              variant="outline"
              icon={<Download className="w-4 h-4" />}
              onClick={handleDownloadResume}
              loading={downloading}
            >
              Download Resume
            </Button>
          )}
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-indigo-600" />
              General Information
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Full Name:</span>
                <span className="font-semibold text-slate-900">{user.name}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-slate-900">{user.email}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Role:</span>
                <span className="font-semibold text-indigo-600">{user.role}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-900">{user.location || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold text-slate-900">{user.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Role-Specific Details */}
          {user.role === 'RECRUITER' ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Company Details
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Company Name:</span>
                  <span className="font-semibold text-slate-900">{user.companyName || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Website:</span>
                  {user.companyWebsite ? (
                    <a
                      href={user.companyWebsite.startsWith('http') ? user.companyWebsite : `https://${user.companyWebsite}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline font-semibold"
                    >
                      {user.companyWebsite}
                    </a>
                  ) : (
                    <span className="text-slate-400">None</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Company Description:</span>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg text-xs leading-relaxed">
                    {user.companyDescription || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Code className="w-4 h-4 text-indigo-600" />
                Candidate Skills & Resume
              </h3>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Skills & Tech Stack
                  </span>
                  {skillsList.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {skillsList.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No skills listed</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Resume Status
                  </span>
                  {user.resumePath ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Resume Uploaded</span>
                      </div>
                      <button
                        onClick={handleDownloadResume}
                        disabled={downloading}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        Download PDF
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No resume attached</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bio Section */}
        {user.bio && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Bio & Profile Summary
            </h3>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {user.bio}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminUserDetailPage;
