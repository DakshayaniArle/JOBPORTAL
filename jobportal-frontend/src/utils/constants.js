// Intelligently resolve API & WebSocket base URLs:
// Using '/api' and '/ws' routes all requests through Vite's local dev server proxy,
// allowing both localhost and network/LAN devices (mobile, other PCs) to access
// the backend on port 8081 without triggering CORS origin errors!
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.startsWith('/')) {
    return envUrl;
  }
  return '/api';
};

const getWsUrl = () => {
  const envWs = import.meta.env.VITE_WS_URL;
  if (envWs && !envWs.includes('localhost') && !envWs.startsWith('/')) {
    return envWs;
  }
  return '/ws';
};

export const API_BASE_URL = getBaseUrl();
export const WS_URL = getWsUrl();

export const ROLES = {
  USER: 'USER',
  RECRUITER: 'RECRUITER',
  ADMIN: 'ADMIN',
};

export const JOB_TYPES = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERNSHIP: 'INTERNSHIP',
  REMOTE: 'REMOTE',
};

export const APPLICATION_STATUS = {
  APPLIED: 'APPLIED',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  OFFERED: 'OFFERED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  HIRED: 'HIRED',
  WITHDRAWN: 'WITHDRAWN',
};

export const STATUS_COLORS = {
  APPLIED: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  SHORTLISTED: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  INTERVIEW_SCHEDULED: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  OFFERED: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  ACCEPTED: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    dot: 'bg-teal-500',
  },
  HIRED: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-600',
  },
  REJECTED: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  WITHDRAWN: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
};
