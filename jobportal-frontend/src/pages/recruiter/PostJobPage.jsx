import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobApi } from '../../api/jobApi';
import { useAuth } from '../../hooks/useAuth';
import { JOB_TYPES } from '../../utils/constants';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import { PlusCircle, AlertCircle, CheckCircle2, Building2 } from 'lucide-react';

export const PostJobPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    company: user?.company || '',
    description: '',
    location: '',
    salary: '',
    experience: '',
    jobType: 'FULL_TIME',
    requiredSkills: '',
  });

  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    setError(null);

    // Client Validation
    if (!formData.title.trim() || !formData.company.trim() || !formData.location.trim() || !formData.requiredSkills.trim()) {
      setError('Please fill in all required fields (Job Title, Company, Location, Required Skills).');
      setLoading(false);
      return;
    }

    const numSalary = formData.salary ? parseFloat(formData.salary) : null;
    if (numSalary !== null && (isNaN(numSalary) || numSalary <= 0)) {
      setError('Salary must be a positive number greater than 0.');
      setLoading(false);
      return;
    }

    const numExp = formData.experience !== '' && formData.experience !== null && formData.experience !== undefined
      ? parseInt(formData.experience, 10)
      : null;

    if (numExp !== null && (isNaN(numExp) || numExp < 0)) {
      setError('Experience cannot be negative.');
      setLoading(false);
      return;
    }

    let calculatedExpLevel = '';
    if (selectedExpPresets.length > 0) {
      calculatedExpLevel = selectedExpPresets.map((p) => p.label).join(', ');
    } else if (numExp !== null) {
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
      await jobApi.createJob(payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/recruiter/jobs');
      }, 1500);
    } catch (err) {
      setError(err?.userMessage || err?.message || 'Failed to publish job opening. Please verify all fields and permissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Post a New Job Opening"
      subtitle="Publish a vacancy. Matching candidates will automatically receive skill alert emails & notifications."
    >
      <div className="max-w-3xl">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Job published successfully! Automatic candidate alerts dispatched. Redirecting...</span>
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
                  helperText="Select one or multiple experience levels below, or type a minimum experience."
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
                {selectedExpPresets.length > 0 && (
                  <div className="mt-2 text-[11px] text-indigo-700 bg-indigo-50/80 px-2.5 py-1.5 rounded-lg border border-indigo-200 flex items-center justify-between">
                    <span>
                      Accepts: <strong>{selectedExpPresets.map((p) => p.label).join(', ')}</strong> (Min: {formData.experience}y)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedExpPresets([]);
                        setFormData((f) => ({ ...f, experience: '' }));
                      }}
                      className="text-rose-600 hover:underline font-semibold ml-2 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
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
              helperText="Critical: Candidates with these skills will receive automatic job match alerts."
              required
            />

            {/* Description */}
            <Textarea
              label="Job Description & Responsibilities"
              id="description"
              name="description"
              rows={5}
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
                isLoading={loading}
                disabled={success}
                className="flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                Publish Job Opening
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PostJobPage;
