import React, { useState, useEffect, useCallback } from 'react';
import { interviewApi } from '../../api/interviewApi';
import { formatDate, getInterviewTimingStatus } from '../../utils/formatters';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ToastAlert from '../../components/common/ToastAlert';
import {
  Calendar,
  Clock,
  Video,
  Building2,
  ExternalLink,
  MessageSquare,
  Bell,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const CandidateInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await interviewApi.getMyInterviews();
      setInterviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to fetch your scheduled interviews.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  // Check for any interview starting within 60 minutes
  const startingSoonInterview = interviews.find((it) => {
    const timing = getInterviewTimingStatus(it.interviewDate, it.interviewTime);
    return timing.isStartingSoon || timing.isHappeningNow;
  });

  return (
    <DashboardLayout
      title="Scheduled Interviews"
      subtitle="View your upcoming and past interview rounds scheduled by recruiters."
    >
      {error && <ToastAlert type="error" message={error} onClose={() => setError(null)} className="mb-6" />}

      {/* 1-Hour Warning Alert Banner */}
      {startingSoonInterview && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-2xl p-5 mb-8 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-xs shrink-0">
              <Bell className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
                  {getInterviewTimingStatus(startingSoonInterview.interviewDate, startingSoonInterview.interviewTime).label}
                </span>
                <span className="text-xs text-white/90">
                  {formatDate(startingSoonInterview.interviewDate)} at {startingSoonInterview.interviewTime}
                </span>
              </div>
              <h3 className="font-bold text-base text-white mt-0.5">
                Interview for {startingSoonInterview.jobTitle || startingSoonInterview.application?.job?.title || 'Job Position'} with {startingSoonInterview.companyName || startingSoonInterview.application?.job?.company || 'Employer'}
              </h3>
            </div>
          </div>

          {startingSoonInterview.meetingLink && (
            <a
              href={
                startingSoonInterview.meetingLink.startsWith('http')
                  ? startingSoonInterview.meetingLink
                  : `https://${startingSoonInterview.meetingLink}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-orange-600 font-bold text-xs hover:bg-orange-50 transition-colors shadow-md shrink-0"
            >
              <Video className="w-4 h-4" />
              Join Video Room
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" text="Loading your interview schedule..." />
        </div>
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-10 h-10 text-indigo-500" />}
          title="No interviews scheduled yet"
          description="When recruiters shortlist your application and book an interview, the schedule and video meeting link will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interviews.map((item) => {
            const app = item.application;
            const job = app?.job;
            const companyName = item.companyName || job?.company || job?.companyName || 'Employer';
            const jobTitle = item.jobTitle || job?.title || 'Job Position';
            const timing = getInterviewTimingStatus(item.interviewDate, item.interviewTime);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition-all ${
                  timing.isClosed
                    ? 'border-slate-200 opacity-75 bg-slate-50/50'
                    : timing.isStartingSoon
                    ? 'border-amber-300 ring-2 ring-amber-100 shadow-md'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Status Badge & Company */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {companyName}
                    </div>

                    {timing.isClosed ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        Interview Closed
                      </span>
                    ) : timing.isHappeningNow ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                        ● Happening Now
                      </span>
                    ) : timing.isStartingSoon ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Starts in {timing.diffMinutes}m
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Upcoming
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    {jobTitle}
                  </h3>

                  {/* Date & Time info */}
                  <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Date: {formatDate(item.interviewDate)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Time: {item.interviewTime || 'TBD'}</span>
                    </div>
                  </div>

                  {/* Remarks */}
                  {item.remarks && (
                    <div className="mb-4 text-xs text-slate-600 flex items-start gap-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                      <MessageSquare className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-700">Recruiter Notes: </span>
                        {item.remarks}
                      </div>
                    </div>
                  )}
                </div>

                {/* Meeting Link Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Video Conference</span>
                  {timing.isClosed ? (
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
                      Meeting Closed
                    </span>
                  ) : item.meetingLink ? (
                    <a
                      href={
                        item.meetingLink.startsWith('http')
                          ? item.meetingLink
                          : `https://${item.meetingLink}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      Join Meeting
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No link provided</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CandidateInterviewsPage;
