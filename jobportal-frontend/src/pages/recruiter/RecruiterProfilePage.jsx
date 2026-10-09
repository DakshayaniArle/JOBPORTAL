import React, { useState, useEffect } from 'react';
import { userApi } from '../../api/userApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Spinner from '../../components/common/Spinner';
import ToastAlert from '../../components/common/ToastAlert';
import { 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Save, 
  Lock,
  FileText
} from 'lucide-react';

const RecruiterProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passError, setPassError] = useState(null);
  const [passSuccess, setPassSuccess] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    companyName: '',
    companyDescription: '',
    companyWebsite: '',
  });

  const [rawProfile, setRawProfile] = useState(null);

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.getProfile();
      setRawProfile(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        company: data.company || '',
        companyName: data.company || '',
        phone: data.phone || '',
        location: data.location || '',
        bio: data.bio || '',
        companyDescription: data.companyDescription || '',
        companyWebsite: data.companyWebsite || '',
      });
    } catch (err) {
      setError(err?.userMessage || err?.message || 'Failed to load recruiter profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setUpdating(true);
      const companyVal = formData.companyName?.trim() || formData.company?.trim() || rawProfile?.company || '';
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        company: companyVal,
        skill: rawProfile?.skill || 'Recruiting',
      };
      const updated = await userApi.updateProfile(payload);
      setRawProfile(updated);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3500);
    } catch (err) {
      setError(err?.userMessage || err?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPassError('Password must be at least 6 characters long');
      return;
    }

    try {
      setChangingPass(true);
      await userApi.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      setPassSuccess('Password changed successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassError(err?.message || 'Failed to change password. Ensure old password is correct.');
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Recruiter Profile">
        <div className="py-20 flex justify-center">
          <Spinner size="lg" text="Loading profile..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Company & Recruiter Profile">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-2xl p-6 md:p-8 text-white shadow-md">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-3xl font-bold text-white shadow-inner">
              {formData.companyName ? formData.companyName.charAt(0).toUpperCase() : <Building2 className="w-10 h-10" />}
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold">{formData.companyName || 'Your Company Name'}</h2>
              <p className="text-indigo-200 text-sm mt-1 flex items-center justify-center md:justify-start gap-4">
                <span>Recruiter: {formData.name || 'Hiring Manager'}</span>
                <span>•</span>
                <span>{formData.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Company & Personal Info Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Organization Details</h3>
          </div>

          {error && <ToastAlert type="error" message={error} onClose={() => setError(null)} className="mb-6" />}
          {success && <ToastAlert type="success" message={success} onClose={() => setSuccess(null)} className="mb-6" />}

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Company / Employer Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Acme Technologies Inc."
                icon={<Building2 className="w-4 h-4" />}
              />

              <Input
                label="Company Website"
                name="companyWebsite"
                type="url"
                value={formData.companyWebsite}
                onChange={handleChange}
                placeholder="https://acme.com"
                icon={<Globe className="w-4 h-4" />}
              />
            </div>

            <Textarea
              label="Company Description & Overview"
              name="companyDescription"
              rows={3}
              value={formData.companyDescription}
              onChange={handleChange}
              placeholder="Tell candidates what makes your company a great place to work..."
            />

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-indigo-600" />
                <h4 className="text-md font-bold text-slate-900">Recruiter Contact Details</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Recruiter Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  icon={<User className="w-4 h-4" />}
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  helperText="Email cannot be changed"
                  icon={<Mail className="w-4 h-4" />}
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  icon={<Phone className="w-4 h-4" />}
                />

                <Input
                  label="Office Location / Headquarters"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. San Francisco, CA"
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>

              <div className="mt-5">
                <Textarea
                  label="Recruiter Bio / Message"
                  name="bio"
                  rows={2}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Short bio or hiring vision..."
                  icon={<FileText className="w-4 h-4" />}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                loading={updating}
                icon={<Save className="w-4 h-4" />}
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Lock className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Change Account Password</h3>
          </div>

          {passError && <ToastAlert type="error" message={passError} onClose={() => setPassError(null)} className="mb-6" />}
          {passSuccess && <ToastAlert type="success" message={passSuccess} onClose={() => setPassSuccess(null)} className="mb-6" />}

          <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
            <Input
              label="Current Password"
              name="oldPassword"
              type="password"
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              required
              placeholder="••••••••"
            />

            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              placeholder="••••••••"
              helperText="Minimum 6 characters"
            />

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              placeholder="••••••••"
            />

            <Button
              type="submit"
              variant="secondary"
              loading={changingPass}
              icon={<Lock className="w-4 h-4" />}
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterProfilePage;
