import React, { useState, useEffect, useCallback } from 'react';
import { savedJobApi } from '../../api/savedJobApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import JobCard from '../../components/jobs/JobCard';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ToastAlert from '../../components/common/ToastAlert';
import { Bookmark } from 'lucide-react';

export const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSavedJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await savedJobApi.getMySavedJobs();
      setSavedJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to fetch saved jobs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const handleRemoveSaved = async (jobId) => {
    try {
      await savedJobApi.removeSavedJob(jobId);
      setSavedJobs((prev) => prev.filter((s) => (s.job?.id || s.id) !== jobId));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  return (
    <DashboardLayout
      title="Saved Bookmarks"
      subtitle="Jobs you have bookmarked for future review and quick application."
    >
      {error && <ToastAlert type="error" message={error} onClose={() => setError(null)} className="mb-6" />}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" text="Loading bookmarked jobs..." />
        </div>
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-10 h-10 text-indigo-500" />}
          title="No saved jobs"
          description="Bookmark interesting job postings while searching to review or apply later."
          actionLabel="Find Jobs to Save"
          onAction={() => (window.location.href = '/jobs')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((saved) => {
            const jobObj = saved.job || saved;
            return (
              <JobCard
                key={saved.id}
                job={jobObj}
                isSaved={true}
                onSaveToggle={(jobId) => handleRemoveSaved(jobId)}
              />
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default SavedJobsPage;
