import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { interviewApi } from '../../api/interviewApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import ToastAlert from '../../components/common/ToastAlert';
import { Calendar, Clock, Video, FileText, ArrowLeft, Send } from 'lucide-react';

const ScheduleInterviewPage = () => {
  const { applicationId: paramAppId } = useParams();
  const [searchParams] = useSearchParams();
  const queryAppId = searchParams.get('applicationId');
  const candidateName = searchParams.get('candidateName') || '';
  const jobTitle = searchParams.get('jobTitle') || '';

  const applicationId = paramAppId || queryAppId;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    applicationId: applicationId ? Number(applicationId) : '',
    interviewDate: '',
    interviewTime: '',
    meetingLink: '',
    remarks: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (applicationId) {
      setFormData(prev => ({ ...prev, applicationId: Number(applicationId) }));
    }
  }, [applicationId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'applicationId' ? (value ? Number(value) : '') : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.applicationId) {
      setError('Application ID is required');
      return;
    }
    if (!formData.interviewDate) {
      setError('Interview date is required');
      return;
    }
    if (!formData.interviewTime) {
      setError('Interview time is required');
      return;
    }
    if (!formData.meetingLink) {
      setError('Meeting link (e.g. Google Meet / Zoom URL) is required');
      return;
    }

    try {
      setLoading(true);
      // Ensure interviewTime is in HH:mm:ss format
      let formattedTime = formData.interviewTime;
      if (formattedTime.length === 5) {
        formattedTime = `${formattedTime}:00`;
      }

      await interviewApi.scheduleInterview({
        applicationId: Number(formData.applicationId),
        interviewDate: formData.interviewDate,
        interviewTime: formattedTime,
        meetingLink: formData.meetingLink.trim(),
        remarks: formData.remarks?.trim() || '',
      });

      setSuccess('Interview scheduled successfully! Notification sent to the candidate.');
      setTimeout(() => {
        navigate('/recruiter/interviews');
      }, 1500);
    } catch (err) {
      setError(err?.message || 'Failed to schedule interview. Please check application status and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Schedule Candidate Interview">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Applicants
          </button>
        </div>

        {candidateName && jobTitle && (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <h3 className="text-sm font-semibold text-indigo-900">Candidate Information</h3>
            <p className="text-sm text-indigo-700 mt-1">
              Candidate: <span className="font-medium text-indigo-950">{candidateName}</span>
            </p>
            <p className="text-sm text-indigo-700">
              Job Position: <span className="font-medium text-indigo-950">{jobTitle}</span>
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Interview Details</h2>
          <p className="text-sm text-slate-500 mb-6">
            Set up an online or offline interview with the shortlisted candidate.
          </p>

          {error && <ToastAlert type="error" message={error} onClose={() => setError(null)} className="mb-6" />}
          {success && <ToastAlert type="success" message={success} className="mb-6" />}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                label="Application ID"
                name="applicationId"
                type="number"
                value={formData.applicationId}
                onChange={handleChange}
                required
                disabled={!!applicationId}
                placeholder="e.g. 101"
                helperText={applicationId ? 'Bound to selected application' : 'Enter application ID'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Interview Date"
                  name="interviewDate"
                  type="date"
                  value={formData.interviewDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>

              <div>
                <Input
                  label="Interview Time"
                  name="interviewTime"
                  type="time"
                  value={formData.interviewTime}
                  onChange={handleChange}
                  required
                  icon={<Clock className="w-4 h-4" />}
                />
              </div>
            </div>

            <div>
              <Input
                label="Meeting / Location Link"
                name="meetingLink"
                type="url"
                value={formData.meetingLink}
                onChange={handleChange}
                required
                placeholder="https://meet.google.com/xyz or https://zoom.us/j/..."
                icon={<Video className="w-4 h-4" />}
                helperText="Provide video meeting link or office location instructions"
              />
            </div>

            <div>
              <Textarea
                label="Remarks & Instructions (Optional)"
                name="remarks"
                rows={4}
                value={formData.remarks}
                onChange={handleChange}
                placeholder="E.g., Round 1: Technical discussion on Java & React. Please keep your resume and portfolio handy."
                icon={<FileText className="w-4 h-4" />}
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                icon={<Send className="w-4 h-4" />}
              >
                Schedule & Send Invite
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ScheduleInterviewPage;
