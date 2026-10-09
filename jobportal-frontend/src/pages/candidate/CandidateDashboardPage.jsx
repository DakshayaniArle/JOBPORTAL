import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { dashboardApi } from '../../api/dashboardApi';
import { userApi } from '../../api/userApi';
import { jobApi } from '../../api/jobApi';
import { interviewApi } from '../../api/interviewApi';
import { savedJobApi } from '../../api/savedJobApi';
import { getInterviewTimingStatus } from '../../utils/formatters';
import DashboardLayout from '../../components/layout/DashboardLayout';
import JobCard from '../../components/jobs/JobCard';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import {
  Briefcase,
  Bookmark,
  Calendar,
  Sparkles,
  CheckCircle2,
  Award,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Video,
  Bell,
  ExternalLink,
} from 'lucide-react';

export const CandidateDashboardPage = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [upcomingInterviewAlert, setUpcomingInterviewAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dashRes, profileRes, recRes, intRes, savedRes] = await Promise.allSettled([
          dashboardApi.getCandidateDashboard(),
          userApi.getProfileCompletion(),
          jobApi.getRecommendedJobs(),
          interviewApi.getMyInterviews(),
          savedJobApi.getMySavedJobs(),
        ]);

        if (dashRes.status === 'fulfilled') {
          setStats(dashRes.value);
        }
        if (profileRes.status === 'fulfilled') {
          setProfileCompletion(profileRes.value);
        }
        if (recRes.status === 'fulfilled') {
          setRecommendations(recRes.value || []);
        }
        if (savedRes.status === 'fulfilled') {
          const list = Array.isArray(savedRes.value) ? savedRes.value : [];
          setSavedJobIds(new Set(list.map((s) => s.job?.id || s.id).filter(Boolean)));
        }
        if (intRes.status === 'fulfilled' && Array.isArray(intRes.value)) {
          // Check for interviews within the next 60 minutes or happening right now
          const urgent = intRes.value.find((it) => {
            const timing = getInterviewTimingStatus(it.interviewDate, it.interviewTime);
            return timing.isStartingSoon || timing.isHappeningNow;
          });
          if (urgent) {
            const timing = getInterviewTimingStatus(urgent.interviewDate, urgent.interviewTime);
            setUpcomingInterviewAlert({ ...urgent, timing });
          }
        }
      } catch (err) {
        setError('Failed to load candidate dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSaveToggle = async (jobId, isCurrentlySaved) => {
    try {
      if (isCurrentlySaved) {
        await savedJobApi.removeSavedJob(jobId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await savedJobApi.saveJob(jobId);
        setSavedJobIds((prev) => new Set([...prev, jobId]));
      }
    } catch (err) {
      console.error('Failed to toggle save on dashboard:', err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Candidate Dashboard" subtitle="Track your job search progress">
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const completionPct = profileCompletion?.completionPercentage || 0;
  const missingFields = profileCompletion?.missingFields || [];

  return (
    <DashboardLayout
      title={`Hello, ${user?.name || 'Candidate'} 👋`}
      subtitle="Welcome to your career hub. Here is an overview of your active applications."
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Upcoming / Urgent Interview Notification (within 1 hour) */}
      {upcomingInterviewAlert && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-2xl p-5 mb-8 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse-slow">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-xs shrink-0">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
                  {upcomingInterviewAlert.timing.label}
                </span>
                <span className="text-xs text-white/90">
                  {upcomingInterviewAlert.interviewDate} at {upcomingInterviewAlert.interviewTime}
                </span>
              </div>
              <h3 className="font-bold text-base text-white mt-0.5">
                Interview for {upcomingInterviewAlert.jobTitle || upcomingInterviewAlert.application?.job?.title || 'Job Application'} with {upcomingInterviewAlert.companyName || upcomingInterviewAlert.application?.job?.company || 'Recruiter'}
              </h3>
              {upcomingInterviewAlert.remarks && (
                <p className="text-xs text-white/80 mt-0.5">{upcomingInterviewAlert.remarks}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {upcomingInterviewAlert.meetingLink && (
              <a
                href={
                  upcomingInterviewAlert.meetingLink.startsWith('http')
                    ? upcomingInterviewAlert.meetingLink
                    : `https://${upcomingInterviewAlert.meetingLink}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-orange-600 font-bold text-xs hover:bg-orange-50 transition-colors shadow-md"
              >
                <Video className="w-4 h-4" />
                Join Video Meeting
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <Link to="/candidate/interviews">
              <button className="px-3 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 text-white text-xs font-semibold transition-colors cursor-pointer">
                View Schedule
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Profile Completion Card (if < 100%) */}
      {completionPct < 100 && (
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white rounded-2xl p-6 mb-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-300" />
                <h3 className="font-bold text-base">Complete Your Profile ({completionPct}%)</h3>
              </div>
              <p className="text-xs text-indigo-200">
                A complete profile gets 3x more views from recruiters. Missing: {missingFields.join(', ')}.
              </p>
            </div>
            <Link to="/candidate/profile" className="shrink-0">
              <Button variant="primary" size="sm" className="bg-white text-indigo-900 hover:bg-indigo-50 border-0">
                Update Profile →
              </Button>
            </Link>
          </div>
          <div className="w-full bg-indigo-950/50 rounded-full h-2.5 mt-4 overflow-hidden">
            <div
              className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Applied</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.totalApplications || 0}</p>
          <Link to="/candidate/applications" className="text-[11px] font-semibold text-indigo-600 hover:underline mt-1 block">
            View all →
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Shortlisted</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-purple-700">{stats?.shortlisted || 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Recruiter picked</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Interviews</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-indigo-700">{stats?.interviews || 0}</p>
          <Link to="/candidate/interviews" className="text-[11px] font-semibold text-indigo-600 hover:underline mt-1 block">
            Schedule →
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Offers</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600">{stats?.offers || 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting reply</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Hired</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">{stats?.hired || 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Success 🎉</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Saved</span>
            <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-800">{stats?.savedJobs || 0}</p>
          <Link to="/candidate/saved-jobs" className="text-[11px] font-semibold text-indigo-600 hover:underline mt-1 block">
            Bookmarks →
          </Link>
        </div>
      </div>

      {/* Recommended Jobs Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Recommended for You
            </h2>
            <p className="text-xs text-slate-500">Based on your verified skills in your candidate profile.</p>
          </div>
          <Link to="/candidate/recommended-jobs" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View All ({recommendations.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Sparkles className="w-10 h-10 text-indigo-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">No skill matches found yet</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Add more skills to your profile to get personalized job match scores.
            </p>
            <Link to="/candidate/profile">
              <Button variant="primary" size="sm">Manage Skills</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map((item) => (
              <JobCard
                key={item.job?.id}
                job={item.job}
                matchPercentage={item.matchPercentage}
                isSaved={savedJobIds.has(item.job?.id)}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboardPage;
