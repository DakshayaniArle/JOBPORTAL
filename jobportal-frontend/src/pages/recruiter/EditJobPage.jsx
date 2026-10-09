import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobApi } from '../../api/jobApi';
import { useAuth } from '../../hooks/useAuth';
import { JOB_TYPES } from '../../utils/constants';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { Edit3, AlertCircle, CheckCircle2, ArrowLeft, Building2 } from 'lucide-react';

export const EditJobPage = () => {
  const { jobId, id: paramId } = useParams();
  const id = jobId || paramId;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    salary: '',
    experience: '',
    experienceLevel: '',
    jobType: 'FULL_TIME',
    requiredSkills: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedExpPresets, setSelectedExpPresets] = useState([]);

  const jobTypeOptions = Object.entries(JOB_TYPES).map(([k, v]) => ({
    value: k,
    label: v,
  }));

  const EXPERIENCE_PRESETS = [
    { label: 'Fresher (0y)', val: 0 },
    { label: '1-2 Years', val: 1 },
    { label: '2+ Years', val: 2 },
    { label: '3+ Years', val: 3 },
    { label: '5+ Years', val: 5 },
    { label: '8+ Years', val: 8 },
  ];

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await jobApi.getJobById(id);
        if (data) {
          setFormData({
            title: data.title || '',
            company: data.company || data.companyName || user?.company || '',
            description: data.description || '',
            location: data.location || '',
            salary: data.salary !== null && data.salary !== undefined ? String(data.salary) : '',
            experience: data.experience !== null && data.experience !== undefined ? String(data.experience) : '',
            experienceLevel: data.experienceLevel || '',
            jobType: data.jobType || 'FULL_TIME',
            requiredSkills: data.requiredSkills || '',
          });

          // Pre-select preset chips matching experience
          if (data.experience !== null && data.experience !== undefined) {
            const match = EXPERIENCE_PRESETS.filter((p) => p.val === data.experience);
            setSelectedExpPresets(match);
          }
        }
      } catch (err) {
        setError(err.userMessage || 'Failed to load job details for editing.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadJob();
    }
  }, [id, user]);

  const toggleExpPreset = (preset) => {
    setSelectedExpPresets((prev) => {
      const exists = prev.some((p) => p.val === preset.val);
      const updated = exists
        ? prev.filter((p) => p.val !== preset.val)
        : [...prev, preset].sort((a, b) => a.val - b.val);

      if (updated.length > 0) {
        const minVal = Math.min(...updated.map((p) => p.val));
        setFormData((f) => ({ ...f, experience: String(minVal) }));
      }
      return updated;
    });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validation
    if (!formData.title.trim() || !formData.location.trim() || !formData.requiredSkills.trim()) {
      setError('Please fill in all required fields (Job Title, Location, Required Skills).');
      setSaving(false);
      return;
    }

    const numSalary = formData.salary ? parseFloat(formData.salary) : null;
    if (numSalary !== null && (isNaN(numSalary) || numSalary <= 0)) {
      setError('Salary must be a positive number greater than 0.');
      setSaving(false);
      return;
    }

    const numExp = formData.experience !== '' && formData.experience !== null && formData.experience !== undefined
      ? parseInt(formData.experience, 10)
      : null;

    if (numExp !== null && (isNaN(numExp) || numExp < 0)) {
      setError('Experience cannot be negative.');
      setSaving(false);
      return;
    }

    let calculatedExpLevel = formData.experienceLevel?.trim() || '';
    if (selectedExpPresets.length > 0) {
      calculatedExpLevel = selectedExpPresets.map((p) => p.label).join(', ');
    } else if (!calculatedExpLevel && numExp !== null) {
      calculatedExpLevel = numExp === 0 ? 'Fresher (0y)' : `${numExp}+ Years`;
    }

    const payload = {
      title: formData.title.trim(),
      company: formData.company.trim(),
      description: formData.description?.trim() || '',
      location: formData.location.trim(),
      salary: numSalary,
      experience: numExp,
      experienceLevel: calculatedExpLevel,
      jobType: formData.jobType || 'FULL_TIME',
      requiredSkills: formData.requiredSkills.trim(),
    };

    try {
      await jobApi.updateJob(id, payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/recruiter/jobs');
      }, 1200);
    } catch (err) {
      setError(err?.userMessage || err?.message || 'Failed to update job. Make sure you own this job posting.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Job Opening">
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Edit Job Opening"
      subtitle="Modify your job vacancy details, requirements, and compensation."
      actions={
        <Link to="/recruiter/jobs">
          <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to My Jobs
          </Button>
        </Link>
      }
    >
      <div className="max-w-3xl">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Job updated successfully! Redirecting to your jobs list...</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Job Title"
                id="title"
                name="title"
                placeholder="e.g. Senior Backend Engineer"
                value={formData.title}
                onChange={handleChange}
                required
              />

              <Input
                label="Company Name"
                id="company"
                name="company"
                placeholder="e.g. Acme Corporation"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>

            {/* Location & Job Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Location"
                id="location"
                name="location"
                placeholder="e.g. Bengaluru, India or Remote"
                value={formData.location}
                onChange={handleChange}
                required
              />

              <Select
                label="Employment Type"
                id="jobType"
                name="jobType"
                options={jobTypeOptions}
                value={formData.jobType}
                onChange={handleChange}
                required
              />
            </div>

            {/* Salary & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Annual Salary (₹ INR)"
                id="salary"
                name="salary"
                type="number"
                min="1000"
                step="50000"
                placeholder="e.g. 1200000"
                value={formData.salary}
                onChange={handleChange}
                helperText="Must be greater than 0."
              />

              <div>
                <Input
                  label="Required Experience (Years)"
                  id="experience"
                  name="experience"
                  type="number"
                  min="0"
                  max="40"
                  placeholder="e.g. 0 for fresher, 2 for 2+ years"
                  value={formData.experience}
                  onChange={handleChange}
                  helperText="Choose presets below or specify minimum years."
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {EXPERIENCE_PRESETS.map((preset) => {
                    const isSelected = selectedExpPresets.some((p) => p.val === preset.val);
                    return (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => toggleExpPreset(preset)}
                        className={`px-2.5 py-1 text-[11px] rounded-lg border font-medium transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Skills */}
            <Input
              label="Required Skills (Comma-Separated)"
              id="requiredSkills"
              name="requiredSkills"
              placeholder="e.g. Java, Spring Boot, MySQL, Docker"
              value={formData.requiredSkills}
              onChange={handleChange}
              helperText="Candidate matching alerts are based on these skills."
              required
            />

            {/* Description */}
            <Textarea
              label="Job Description & Responsibilities"
              id="description"
              name="description"
              rows={6}
              placeholder="Outline daily duties, prerequisites, team structure, and perks..."
              value={formData.description}
              onChange={handleChange}
            />

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/recruiter/jobs')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={saving}
                disabled={success}
                className="flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditJobPage;

