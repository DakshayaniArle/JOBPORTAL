import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate, formatSalary, parseSkills } from '../../utils/formatters';
import { savedJobApi } from '../../api/savedJobApi';
import useAuth from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Bookmark, 
  BookmarkCheck, 
  ArrowRight,
  Sparkles,
  Edit
} from 'lucide-react';

const JobCard = ({
  job,
  matchPercentage,
  isSaved = false,
  savedJobId = null,
  onSaveToggle,
  featured = false,
  className = '',
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, role } = useAuth();
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  if (!job) return null;

  const companyName = job.company || job.companyName || 'Employer';
  const rawSkills = job.requiredSkills || job.skill || job.skills;
  const skillsList = parseSkills(rawSkills);

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (role !== ROLES.USER) {
      return;
    }

    try {
      setSaving(true);
      if (onSaveToggle) {
        // Parent component manages the toggle and state
        await onSaveToggle(job.id, saved);
      } else {
        // Self-managed toggle
        if (saved) {
          await savedJobApi.removeSavedJob(job.id);
          setSaved(false);
        } else {
          await savedJobApi.saveJob(job.id);
          setSaved(true);
        }
      }
    } catch (err) {
      console.error('Failed to toggle save job:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between p-6 ${
        featured ? 'border-indigo-200 bg-gradient-to-b from-indigo-50/20 to-white shadow-xs' : 'border-slate-200 shadow-xs'
      } ${className}`}
    >
      <div>
        {/* Top Header: Company Avatar, Titles & Save Button */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-base shadow-inner shrink-0 group-hover:border-indigo-200 group-hover:bg-indigo-50/50 transition-colors">
              {companyName ? companyName.charAt(0).toUpperCase() : <Building2 className="w-6 h-6 text-slate-400" />}
            </div>
            <div>
              <Link
                to={`/jobs/${job.id}`}
                className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1"
              >
                {job.title}
              </Link>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-semibold text-slate-700">{companyName}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {job.location || 'Remote'}
                </span>
              </div>
            </div>
          </div>

          {/* Recruiter Edit Button or Candidate Bookmark Button */}
          {isAuthenticated && role === ROLES.RECRUITER && (job.recruiter?.id === user?.id || job.recruiter?.email === user?.email || !job.recruiter) ? (
            <Link
              to={`/recruiter/jobs/${job.id}/edit`}
              onClick={(e) => e.stopPropagation()}
              title="Edit this job opening"
              className="p-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors shrink-0"
            >
              <Edit className="w-4 h-4" />
            </Link>
          ) : (!isAuthenticated || role === ROLES.USER) ? (
            <button
              onClick={handleBookmarkClick}
              disabled={saving}
              aria-label={saved ? 'Remove from saved jobs' : 'Save this job'}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                saved
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              {saved ? <BookmarkCheck className="w-4 h-4 fill-indigo-600 text-indigo-600" /> : <Bookmark className="w-4 h-4" />}
            </button>
          ) : null}
        </div>

        {/* Badges / Highlights */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {matchPercentage !== undefined && matchPercentage !== null && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
              {matchPercentage}% Match
            </span>
          )}

          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <DollarSign className="w-3.5 h-3.5 mr-0.5 text-emerald-500" />
            {formatSalary(job.salary)}
          </span>

          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
            {job.jobType ? String(job.jobType).replace(/_/g, ' ') : 'Full Time'}
          </span>

          {(job.experienceLevel || (job.experience !== undefined && job.experience !== null)) && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
              {job.experienceLevel || (job.experience === 0 ? 'Fresher' : `${job.experience}y Exp`)}
            </span>
          )}

          {job.active === false && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              Closed
            </span>
          )}
        </div>

        {/* Description snippet */}
        {job.description && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {job.description}
          </p>
        )}

        {/* Skills Tags */}
        {skillsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {skillsList.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 border border-slate-200 text-slate-600"
              >
                {skill}
              </span>
            ))}
            {skillsList.length > 4 && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500">
                +{skillsList.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Details: Posted date & Apply Link */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1 text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Posted {formatDate(job.postedDate)}</span>
        </div>

        {isAuthenticated && role === ROLES.RECRUITER && (job.recruiter?.id === user?.id || job.recruiter?.email === user?.email || !job.recruiter) ? (
          <div className="flex items-center gap-3">
            <Link
              to={`/recruiter/jobs/${job.id}/edit`}
              className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-indigo-600 hover:underline"
            >
              <Edit className="w-3.5 h-3.5" /> Edit
            </Link>
            <Link
              to={`/jobs/${job.id}`}
              className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              View Details <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <Link
            to={`/jobs/${job.id}`}
            className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            View Details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default JobCard;
