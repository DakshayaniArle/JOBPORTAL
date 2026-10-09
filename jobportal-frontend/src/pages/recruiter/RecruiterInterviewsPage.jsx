import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { interviewApi } from '../../api/interviewApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ToastAlert from '../../components/common/ToastAlert';
import { formatDate, getInterviewTimingStatus } from '../../utils/formatters';
import { 
  Calendar, 
  Clock, 
  Video, 
  User, 
  Briefcase, 
  ExternalLink, 
  Search,
  PlusCircle,
  FileText,
  Bell
} from 'lucide-react';

const RecruiterInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await interviewApi.getRecruiterInterviews();
      setInterviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to load scheduled interviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const startingSoonInterview = interviews.find((it) => {
    const timing = getInterviewTimingStatus(it.interviewDate, it.interviewTime);
    return timing.isStartingSoon || timing.isHappeningNow;
  });

  const filteredInterviews = interviews.filter(item => {
    const term = searchTerm.toLowerCase();
    const candidateName = (item.candidateName || '').toLowerCase();
    const candidateEmail = (item.candidateEmail || '').toLowerCase();
    const jobTitle = (item.jobTitle || '').toLowerCase();
    return candidateName.includes(term) || candidateEmail.includes(term) || jobTitle.includes(term);
  });

  return (
    <DashboardLayout title="Scheduled Interviews">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Candidate Interviews</h2>
            <p className="text-sm text-slate-500">Track and manage all upcoming, active, and completed interviews</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/recruiter/jobs">
              <Button variant="primary" icon={<PlusCircle className="w-4 h-4" />}>
                View Applicants to Schedule
              </Button>
            </Link>
          </div>
        </div>

        {error && <ToastAlert type="error" message={error} onClose={() => setError(null)} />}

        {/* 1-Hour Reminder Alert Banner */}
        {startingSoonInterview && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-2xl p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                  Interview with candidate: {startingSoonInterview.candidateName || 'Applicant'} for {startingSoonInterview.jobTitle || 'Role'}
                </h3>
              </div>
            </div>

            {startingSoonInterview.meetingLink && (
              <a
                href={startingSoonInterview.meetingLink.startsWith('http') ? startingSoonInterview.meetingLink : `https://${startingSoonInterview.meetingLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-orange-600 font-bold text-xs hover:bg-orange-50 transition-colors shadow-md shrink-0"
              >
                <Video className="w-4 h-4" />
                Start / Join Meeting
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Filter / Search bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by candidate name, email, or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Total Interviews:</span>
            <span className="font-semibold text-slate-900">{interviews.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Spinner size="lg" text="Loading interviews..." />
          </div>
        ) : filteredInterviews.length === 0 ? (
          <EmptyState
            title="No Interviews Found"
            description={
              searchTerm
                ? `No interviews match "${searchTerm}". Try a different keyword.`
                : "You haven't scheduled any candidate interviews yet."
            }
            icon={<Calendar className="w-12 h-12 text-slate-300" />}
            action={
              !searchTerm ? (
                <Link to="/recruiter/jobs">
                  <Button variant="outline">Browse My Jobs & Applicants</Button>
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInterviews.map((item) => {
              const timing = getInterviewTimingStatus(item.interviewDate, item.interviewTime);

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between ${
                    timing.isClosed
                      ? 'border-slate-200 opacity-75 bg-slate-50/50'
                      : timing.isStartingSoon
                      ? 'border-amber-300 ring-2 ring-amber-100'
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                          {item.candidateName ? item.candidateName.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{item.candidateName || 'Candidate'}</h3>
                          <p className="text-xs text-slate-500">{item.candidateEmail || 'No email provided'}</p>
                        </div>
                      </div>

                      {timing.isClosed ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Closed / Completed
                        </span>
                      ) : timing.isHappeningNow ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                          ● Happening Now
                        </span>
                      ) : timing.isStartingSoon ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Starts in {timing.diffMinutes}m
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Scheduled
                        </span>
                      )}
                    </div>

                    <div className="space-y-2.5 text-sm mb-4 border-t border-b border-slate-100 py-3">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-900">{item.jobTitle || 'Job Application'}</span>
                      </div>

                      <div className="flex items-center gap-4 text-slate-600 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-indigo-500" />
                          <span>{formatDate(item.interviewDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          <span>{item.interviewTime}</span>
                        </div>
                      </div>

                      {item.remarks && (
                        <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg mt-2">
                          <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <span>{item.remarks}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Application #{item.applicationId}</span>
                    {timing.isClosed ? (
                      <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
                        Meeting Ended
                      </span>
                    ) : item.meetingLink ? (
                      <a
                        href={item.meetingLink.startsWith('http') ? item.meetingLink : `https://${item.meetingLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
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
      </div>
    </DashboardLayout>
  );
};

export default RecruiterInterviewsPage;
