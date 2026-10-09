import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobApi } from '../../api/jobApi';
import { savedJobApi } from '../../api/savedJobApi';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import JobCard from '../../components/jobs/JobCard';
import JobFilterBar from '../../components/jobs/JobFilterBar';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { Briefcase } from 'lucide-react';

export const JobsPage = () => {
  const { isAuthenticated, role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state (Spring Data Pageable)
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filter state
  const [filters, setFilters] = useState({
    title: searchParams.get('title') || '',
    location: searchParams.get('location') || '',
    company: searchParams.get('company') || '',
    skill: searchParams.get('skill') || '',
    jobType: searchParams.get('jobType') || '',
    experience: searchParams.get('experience') || '',
    minSalary: searchParams.get('minSalary') || '',
  });

  // Fetch candidate's saved job IDs for bookmark badges
  const fetchSavedJobs = useCallback(async () => {
    if (isAuthenticated && role === ROLES.USER) {
      try {
        const savedList = await savedJobApi.getMySavedJobs();
        const ids = new Set(savedList.map((s) => s.job?.id).filter(Boolean));
        setSavedJobIds(ids);
      } catch (err) {
        console.error('Failed to fetch saved jobs', err);
      }
    }
  }, [isAuthenticated, role]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const hasActiveFilters = Boolean(
    filters.title ||
    filters.location ||
    filters.company ||
    filters.skill ||
    filters.jobType ||
    filters.experience ||
    filters.minSalary
  );

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (hasActiveFilters) {
        // Use multi-criteria filter API
        const data = await jobApi.filterJobs(filters);
        const activeJobs = (data || []).filter((j) => j.active !== false);
        setJobs(activeJobs);
        setTotalElements(activeJobs.length);
        setTotalPages(1);
      } else {
        // Use standard pagination API
        const data = await jobApi.getJobs({ page, size: 9, sort: 'postedDate,desc' });
        setJobs(data?.content || []);
        setTotalPages(data?.totalPages || 1);
        setTotalElements(data?.totalElements || 0);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [hasActiveFilters, filters, page]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchSubmit = () => {
    setPage(0);
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) newParams.set(k, v);
    });
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setFilters({
      title: '',
      location: '',
      company: '',
      skill: '',
      jobType: '',
      experience: '',
      minSalary: '',
    });
    setSearchParams({});
    setPage(0);
  };

  const handleSaveToggle = async (jobId, isCurrentlySaved) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
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
      alert(err.userMessage || 'Failed to update saved job');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Explore All Opportunities
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Filter by required skills, salary range, experience, and employment type.
          </p>
        </div>

        {/* Filter component */}
        <JobFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearchSubmit={handleSearchSubmit}
          onReset={handleResetFilters}
          isLoading={loading}
        />

        {/* Error message banner */}
        {error && (
          <div className="p-4 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {/* Job Cards Grid / Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" />
            <p className="text-sm text-slate-500 mt-3">Searching available jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs matched your criteria"
            description="Try loosening your search filters or resetting them to view all open vacancies."
            actionLabel="Reset Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobIds.has(job.id)}
                  onSaveToggle={role === ROLES.USER ? handleSaveToggle : undefined}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {!hasActiveFilters && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalElements={totalElements}
                onPageChange={(newPage) => {
                  setPage(newPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default JobsPage;
