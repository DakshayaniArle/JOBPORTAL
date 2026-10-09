import React, { useState, useEffect } from 'react';
import { jobApi } from '../../api/jobApi';
import { savedJobApi } from '../../api/savedJobApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import JobCard from '../../components/jobs/JobCard';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ToastAlert from '../../components/common/ToastAlert';
import { Sparkles } from 'lucide-react';

export const RecommendedJobsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [recRes, savedRes] = await Promise.allSettled([
          jobApi.getRecommendedJobs(),
          savedJobApi.getMySavedJobs(),
        ]);

        if (recRes.status === 'fulfilled') {
          setRecommendations(Array.isArray(recRes.value) ? recRes.value : []);
        } else {
          setError('Failed to load recommended jobs.');
        }

        if (savedRes.status === 'fulfilled') {
          const list = Array.isArray(savedRes.value) ? savedRes.value : [];
          const ids = new Set(list.map((s) => s.job?.id || s.id).filter(Boolean));
          setSavedJobIds(ids);
        }
      } catch (err) {
        setError('Error retrieving recommendations.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      console.error('Failed to toggle save job:', err);
    }
  };

  return (
    <DashboardLayout
      title="Recommended Jobs"
      subtitle="Job matches calculated from your profile skills and job requirements."
    >
      {error && <ToastAlert type="error" message={error} onClose={() => setError(null)} className="mb-6" />}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" text="Analyzing your skills & calculating job matches..." />
        </div>
      ) : recommendations.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-10 h-10 text-indigo-500" />}
          title="No skill matches found yet"
          description="Update your candidate profile with more skills or browse the complete job catalog to find opportunities."
          actionLabel="Edit Profile Skills"
          onAction={() => (window.location.href = '/candidate/profile')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((item, index) => {
            const jobObj = item.job || item;
            return (
              <JobCard
                key={jobObj.id || index}
                job={jobObj}
                matchPercentage={item.matchPercentage}
                isSaved={savedJobIds.has(jobObj.id)}
                onSaveToggle={handleSaveToggle}
              />
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default RecommendedJobsPage;
