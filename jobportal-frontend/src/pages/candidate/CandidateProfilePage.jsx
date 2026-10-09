import React, { useState, useEffect, useCallback } from 'react';
import { userApi } from '../../api/userApi';
import useAuth from '../../hooks/useAuth';
import { parseSkills } from '../../utils/formatters';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import ToastAlert from '../../components/common/ToastAlert';
import {
  User,
  Mail,
  FileText,
  Upload,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const CandidateProfilePage = () => {
  const { updateUserProfile, updateUser } = useAuth();
  const syncUser = updateUserProfile || updateUser;

  const [profile, setProfile] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Skill Add State
  const [newSkill, setNewSkill] = useState('');
  const [addingSkill, setAddingSkill] = useState(false);

  // Resume Upload State
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeSuccess, setResumeSuccess] = useState(false);

  const [error, setError] = useState(null);

  const fetchProfileData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const [userRes, completionRes] = await Promise.allSettled([
        userApi.getProfile(),
        userApi.getProfileCompletion(),
      ]);

      if (userRes.status === 'fulfilled' && userRes.value) {
        const u = userRes.value;
        setProfile(u);
        setName(u.name || '');
        setEmail(u.email || '');
      }

      if (completionRes.status === 'fulfilled') {
        setProfileCompletion(completionRes.value);
      }
    } catch (err) {
      setError(err?.userMessage || err?.message || 'Failed to load profile details.');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData(true);
  }, [fetchProfileData]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setError(null);
    try {
      const updated = await userApi.updateProfile({
        name: name.trim(),
        email: email.trim(),
        skill: profile?.skill || 'General',
      });
      setProfile(updated);
      if (syncUser) {
        syncUser({ name: updated.name, email: updated.email });
      }
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
      fetchProfileData(false);
    } catch (err) {
      setError(err?.userMessage || err?.message || 'Failed to update personal details.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    setAddingSkill(true);
    setError(null);
    try {
      const updated = await userApi.addSkill(newSkill.trim());
      setProfile(updated);
      setNewSkill('');
      fetchProfileData(false);
    } catch (err) {
      setError(err?.userMessage || err?.message || 'Failed to add skill.');
    } finally {
      setAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    setError(null);
    try {
      const updated = await userApi.removeSkill(skillToRemove);
      setProfile(updated);
      fetchProfileData(false);
    } catch (err) {
      setError(err?.userMessage || err?.message || 'Failed to remove skill.');
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    setUploadingResume(true);
    setError(null);
    try {
      const updated = await userApi.uploadResume(resumeFile);
      setProfile(updated);
      setResumeFile(null);
      setResumeSuccess(true);
      setTimeout(() => setResumeSuccess(false), 3000);
      fetchProfileData(false);
    } catch (err) {
      setError(err?.userMessage || err?.message || 'Failed to upload resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Profile & Resume" subtitle="Manage your candidate credentials">
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" text="Loading candidate profile..." />
        </div>
      </DashboardLayout>
    );
  }

  const skills = parseSkills(profile?.skill || profile?.skills);
  const completionPct = profileCompletion?.completionPercentage || 0;
  const missingFields = profileCompletion?.missingFields || [];

  return (
    <DashboardLayout
      title="Candidate Profile"
      subtitle="Keep your skills, personal information, and resume up to date for recruiters."
    >
      {error && <ToastAlert type="error" message={error} onClose={() => setError(null)} className="mb-6" />}

      {/* Profile Completion Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Profile Completeness: {completionPct}%
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {completionPct === 100 ? 'All Fields Complete! 🚀' : `${missingFields.length} field(s) remaining`}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              completionPct === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${completionPct}%` }}
          />
        </div>
        {missingFields.length > 0 && (
          <p className="text-xs text-slate-500 mt-2">
            Missing items to reach 100%: <span className="font-semibold text-slate-700">{missingFields.join(', ')}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Personal Information */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Personal Information
            </h2>

            {profileSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Personal details updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Full Name"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={updatingProfile}
              >
                Save Changes
              </Button>
            </form>
          </div>

          {/* Resume Upload Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Resume Document
            </h2>

            {resumeSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Resume uploaded successfully!</span>
              </div>
            )}

            {/* Currently uploaded file */}
            {profile?.resumeName ? (
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                      {profile.resumeName}
                    </p>
                    <p className="text-xs text-indigo-600 font-medium">Uploaded & Attached to Applications</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs mb-4">
                No resume uploaded yet. Recruiters recommend uploading a PDF or DOCX format resume.
              </div>
            )}

            {/* Upload form */}
            <form onSubmit={handleResumeUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload New Resume (PDF / DOC / DOCX, max 10MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              <Button
                type="submit"
                variant="secondary"
                size="md"
                disabled={!resumeFile}
                loading={uploadingResume}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload File
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Skills Management */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Skills & Expertise
            </h2>
            <p className="text-xs text-slate-500 mb-6 pb-2 border-b border-slate-100">
              Your skills are used to match you with recommended jobs and alerts.
            </p>

            {/* Add skill input */}
            <form onSubmit={handleAddSkill} className="flex gap-2 mb-6">
              <Input
                placeholder="Add skill (e.g. Docker, TypeScript)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={addingSkill}
                disabled={!newSkill.trim()}
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </form>

            {/* Skills chips list */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Current Skills ({skills.length})
              </h3>
              {skills.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200"
                    >
                      {sk}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(sk)}
                        className="p-0.5 hover:bg-indigo-200/60 rounded-full text-indigo-500 hover:text-indigo-800 transition-colors cursor-pointer"
                        title={`Remove ${sk}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CandidateProfilePage;
