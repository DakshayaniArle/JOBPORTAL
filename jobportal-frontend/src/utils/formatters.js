export const formatSalary = (salary) => {
  if (salary === null || salary === undefined || isNaN(Number(salary))) {
    return 'Competitive / Not Disclosed';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(salary);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return String(dateString);
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return String(dateString);
  }
};

export const parseSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  if (typeof skills === 'string') {
    return skills
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

export const getInterviewTimingStatus = (interviewDate, interviewTime) => {
  if (!interviewDate) {
    return { status: 'SCHEDULED', label: 'Scheduled', isClosed: false, isStartingSoon: false, isHappeningNow: false, diffMinutes: 0 };
  }

  try {
    const timeStr = interviewTime ? String(interviewTime).slice(0, 5) : '00:00';
    const interviewDateTime = new Date(`${interviewDate}T${timeStr}:00`);
    const now = new Date();

    if (isNaN(interviewDateTime.getTime())) {
      return { status: 'SCHEDULED', label: 'Scheduled', isClosed: false, isStartingSoon: false, isHappeningNow: false, diffMinutes: 0 };
    }

    // Difference in minutes (positive = future, negative = past)
    const diffMinutes = Math.round((interviewDateTime.getTime() - now.getTime()) / 60000);

    if (diffMinutes < -60) {
      return {
        status: 'CLOSED',
        label: 'Closed / Completed',
        isClosed: true,
        isStartingSoon: false,
        isHappeningNow: false,
        diffMinutes,
      };
    } else if (diffMinutes >= -60 && diffMinutes <= 0) {
      return {
        status: 'IN_PROGRESS',
        label: 'Happening Now',
        isClosed: false,
        isStartingSoon: false,
        isHappeningNow: true,
        diffMinutes,
      };
    } else if (diffMinutes > 0 && diffMinutes <= 60) {
      return {
        status: 'STARTING_SOON',
        label: `Starts in ${diffMinutes} min`,
        isClosed: false,
        isStartingSoon: true,
        isHappeningNow: false,
        diffMinutes,
      };
    } else {
      return {
        status: 'UPCOMING',
        label: 'Upcoming',
        isClosed: false,
        isStartingSoon: false,
        isHappeningNow: false,
        diffMinutes,
      };
    }
  } catch {
    return { status: 'SCHEDULED', label: 'Scheduled', isClosed: false, isStartingSoon: false, isHappeningNow: false, diffMinutes: 0 };
  }
};

