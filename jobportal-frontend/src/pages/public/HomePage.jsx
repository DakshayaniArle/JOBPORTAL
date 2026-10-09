import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Search,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Zap,
  Building2,
  Users,
  Sparkles,
} from 'lucide-react';
import { jobApi } from '../../api/jobApi';
import { savedJobApi } from '../../api/savedJobApi';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import JobCard from '../../components/jobs/JobCard';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Spinner from '../../components/common/Spinner';

export const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [recentJobs, setRecentJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = useCallback(async () => {
    if (isAuthenticated && role === ROLES.USER) {
      try {
        const savedList = await savedJobApi.getMySavedJobs();
        const ids = new Set((savedList || []).map((s) => s.job?.id || s.id).filter(Boolean));
        setSavedJobIds(ids);
      } catch (err) {
        console.error('Failed to load saved jobs on homepage', err);
      }
    } else {
      setSavedJobIds(new Set());
    }
  }, [isAuthenticated, role]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        const data = await jobApi.getJobs({ page: 0, size: 6, sort: 'postedDate,desc' });
        setRecentJobs(data?.content || []);
      } catch (err) {
        console.error('Failed to load recent jobs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentJobs();
  }, []);

  const handleSaveToggle = async (jobId, isCurrentlySaved) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (role !== ROLES.USER) return;

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
      console.error('Failed to toggle save on homepage:', err);
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('title', keyword.trim());
    if (location.trim()) params.set('location', location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-800 to-slate-900 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            Empowering Next-Gen Careers
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Find Your Dream Job or <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300">
              Hire Top Talent Instantly
            </span>
          </h1>

          <p className="text-base sm:text-lg text-indigo-100/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover thousands of handpicked career opportunities, match with employers based on your verified skills, and track applications in real time.
          </p>

          {/* Quick Search Bar */}
          <form
            onSubmit={handleHeroSearch}
            className="bg-white p-2 sm:p-3 rounded-2xl shadow-2xl max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-2 text-slate-800"
          >
            <div className="flex-1 flex items-center gap-2 px-3 w-full border-b sm:border-b-0 sm:border-r border-slate-200 py-2">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title, skill, or keyword..."
                className="w-full text-sm bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="flex-1 flex items-center gap-2 px-3 w-full py-2">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (city or Remote)..."
                className="w-full text-sm bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-md shrink-0 cursor-pointer"
            >
              Search Jobs
            </button>
          </form>

          {/* Popular tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-xs text-indigo-200">
            <span className="text-indigo-300">Popular:</span>
            {['Java', 'React', 'Spring Boot', 'Python', 'Remote', 'Full Time'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => navigate(`/jobs?skill=${tag}`)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Skill-Matched Recommendations</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our algorithm matches your exact profile skills with job requirements to calculate your compatibility percentage.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Real-Time Application Funnel</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Stay informed with instant STOMP WebSocket notifications when recruiters shortlist, schedule interviews, or extend job offers.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Direct Recruiter Scheduling</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seamless interview scheduling with Google Meet links, clear timings, and structured recruiter status transitions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Featured Job Openings
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Explore the latest active jobs posted by leading companies.
            </p>
          </div>
          <Link
            to="/jobs"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors shrink-0"
          >
            Explore All Jobs →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : recentJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No active jobs posted yet.</p>
            <p className="text-slate-400 text-xs mt-1">Check back later or register as an employer to post openings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedJobIds.has(job.id)}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
        )}
      </section>

      {/* Call to action banner */}
      <section className="bg-indigo-900 text-white py-12 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-bold mb-2">Are You Hiring Talent?</h3>
            <p className="text-indigo-200 text-sm max-w-md">
              Create an employer account to post openings, review applicants, and schedule candidate interviews effortlessly.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              to="/recruiter/register"
              className="px-5 py-2.5 bg-white text-indigo-900 font-semibold text-sm rounded-xl hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Post a Job for Free
            </Link>
            <Link
              to="/recruiter/login"
              className="px-5 py-2.5 bg-indigo-800 text-white border border-indigo-700 font-semibold text-sm rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Recruiter Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
