import React, { useState, useEffect } from 'react';
import { JOB_TYPES } from '../../utils/constants';
import { Search, MapPin, DollarSign, RotateCcw } from 'lucide-react';
import Button from '../common/Button';

const JobFilterBar = ({
  filters,
  onFilterChange,
  onSearchSubmit,
  onSearch,
  onFilter,
  onReset,
  initialFilters = {},
  isLoading = false,
  className = '',
}) => {
  // If controlled via `filters` prop
  const isControlled = Boolean(filters && onFilterChange);

  const [localKeyword, setLocalKeyword] = useState(
    filters?.title || initialFilters.keyword || ''
  );
  const [localLocation, setLocalLocation] = useState(
    filters?.location || initialFilters.location || ''
  );
  const [localJobType, setLocalJobType] = useState(
    filters?.jobType || initialFilters.jobType || ''
  );
  const [localExperience, setLocalExperience] = useState(
    filters?.experience !== undefined ? filters.experience : initialFilters.experience || ''
  );
  const [localMinSalary, setLocalMinSalary] = useState(
    filters?.minSalary || initialFilters.minSalary || ''
  );
  const [localMaxSalary, setLocalMaxSalary] = useState(
    filters?.maxSalary || initialFilters.maxSalary || ''
  );

  useEffect(() => {
    if (filters) {
      if (filters.title !== undefined) setLocalKeyword(filters.title);
      if (filters.location !== undefined) setLocalLocation(filters.location);
      if (filters.jobType !== undefined) setLocalJobType(filters.jobType);
      if (filters.experience !== undefined) setLocalExperience(filters.experience);
      if (filters.minSalary !== undefined) setLocalMinSalary(filters.minSalary);
      if (filters.maxSalary !== undefined) setLocalMaxSalary(filters.maxSalary);
    }
  }, [filters]);

  const handleKeywordChange = (val) => {
    setLocalKeyword(val);
    if (isControlled) {
      onFilterChange('title', val);
    }
  };

  const handleLocationChange = (val) => {
    setLocalLocation(val);
    if (isControlled) {
      onFilterChange('location', val);
    }
  };

  const handleJobTypeChange = (val) => {
    setLocalJobType(val);
    if (isControlled) {
      onFilterChange('jobType', val);
    }
  };

  const handleExperienceChange = (val) => {
    setLocalExperience(val);
    if (isControlled) {
      onFilterChange('experience', val);
    }
  };

  const handleMinSalaryChange = (val) => {
    setLocalMinSalary(val);
    if (isControlled) {
      onFilterChange('minSalary', val);
    }
  };

  const handleMaxSalaryChange = (val) => {
    setLocalMaxSalary(val);
    if (isControlled) {
      onFilterChange('maxSalary', val);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit();
    } else if (onFilter) {
      onFilter({
        location: localLocation.trim(),
        jobType: localJobType,
        experience: localExperience !== '' ? Number(localExperience) : undefined,
        minSalary: localMinSalary ? Number(localMinSalary) : undefined,
        maxSalary: localMaxSalary ? Number(localMaxSalary) : undefined,
      });
    } else if (onSearch) {
      onSearch(localKeyword);
    }
  };

  const handleResetClick = () => {
    setLocalKeyword('');
    setLocalLocation('');
    setLocalJobType('');
    setLocalExperience('');
    setLocalMinSalary('');
    setLocalMaxSalary('');
    if (onReset) onReset();
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 mb-6 ${className}`}>
      {/* Search by keyword */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by job title, company, skills, or role keywords..."
            value={localKeyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
          />
        </div>
        <Button type="submit" variant="primary" loading={isLoading}>
          Search
        </Button>
      </form>

      {/* Advanced Filters */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100">
        {/* Location */}
        <div className="relative">
          <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Location / City"
            value={localLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Job Type */}
        <div>
          <select
            value={localJobType}
            onChange={(e) => handleJobTypeChange(e.target.value)}
            aria-label="Filter by job type"
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-700"
          >
            <option value="">All Job Types</option>
            {Object.values(JOB_TYPES).map((type) => (
              <option key={type} value={type}>
                {String(type).replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Experience Level Selector */}
        <div>
          <select
            value={localExperience}
            onChange={(e) => handleExperienceChange(e.target.value)}
            aria-label="Filter by required experience"
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-700 font-medium"
          >
            <option value="">Any Experience</option>
            <option value="0">Fresher (0 Years)</option>
            <option value="1">1+ Years Exp</option>
            <option value="2">2+ Years Exp</option>
            <option value="3">3+ Years Exp</option>
            <option value="5">5+ Years Exp</option>
            <option value="8">8+ Years Exp</option>
            <option value="10">10+ Years Exp</option>
          </select>
        </div>

        {/* Min Salary */}
        <div className="relative">
          <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="number"
            placeholder="Min Salary ($)"
            value={localMinSalary}
            onChange={(e) => handleMinSalaryChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Max Salary */}
        <div className="relative">
          <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="number"
            placeholder="Max Salary ($)"
            value={localMaxSalary}
            onChange={(e) => handleMaxSalaryChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" variant="secondary" className="flex-1" loading={isLoading}>
            Apply Filters
          </Button>
          <button
            type="button"
            onClick={handleResetClick}
            title="Reset Filters"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobFilterBar;
