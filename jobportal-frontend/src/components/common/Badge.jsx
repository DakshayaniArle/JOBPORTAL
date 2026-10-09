import React from 'react';
import { STATUS_COLORS } from '../../utils/constants';

const Badge = ({
  status,
  jobType,
  label,
  variant,
  size = 'md',
  dot = true,
  className = '',
}) => {
  if (jobType) {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
      >
        {String(jobType).replace(/_/g, ' ')}
      </span>
    );
  }

  const normalizedStatus = status ? String(status).toUpperCase() : '';
  const statusStyle = STATUS_COLORS[normalizedStatus] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-500',
  };

  const displayText = label || (status ? String(status).replace(/_/g, ' ') : 'N/A');

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} ${sizes[size]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 mr-1.5 rounded-full ${statusStyle.dot}`}
          aria-hidden="true"
        />
      )}
      {displayText}
    </span>
  );
};

export default Badge;
