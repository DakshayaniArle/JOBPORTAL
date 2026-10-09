import React, { useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDateTime } from '../../utils/formatters';
import DashboardLayout from '../../components/layout/DashboardLayout';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import {
  Bell,
  CheckCircle,
  Briefcase,
  Calendar,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

export const NotificationsPage = () => {
  const { notifications, unreadCount, refreshNotifications, markAllAsRead } = useNotifications();

  useEffect(() => {
    if (typeof refreshNotifications === 'function') {
      refreshNotifications();
    }
    // Automatically mark all notifications as seen when viewing the hub
    if (typeof markAllAsRead === 'function') {
      markAllAsRead();
    }
  }, [refreshNotifications, markAllAsRead]);

  const getIconForType = (type) => {
    switch (type) {
      case 'APPLICATION':
        return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'STATUS':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'OFFER':
      case 'HIRED':
        return <Sparkles className="w-5 h-5 text-emerald-600" />;
      case 'INTERVIEW':
        return <Calendar className="w-5 h-5 text-indigo-600" />;
      case 'JOB':
        return <Sparkles className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getBgForType = (type) => {
    switch (type) {
      case 'APPLICATION':
        return 'bg-blue-50 border-blue-100';
      case 'STATUS':
      case 'OFFER':
      case 'HIRED':
        return 'bg-emerald-50 border-emerald-100';
      case 'INTERVIEW':
        return 'bg-indigo-50 border-indigo-100';
      case 'JOB':
        return 'bg-amber-50 border-amber-100';
      default:
        return 'bg-slate-50 border-slate-100';
    }
  };

  return (
    <DashboardLayout
      title="Notifications Hub"
      subtitle="Real-time alerts regarding application statuses, candidate responses, and interviews."
      actions={
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-indigo-600 border-indigo-200"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Mark all as read
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshNotifications}
            className="flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      }
    >
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="When you receive job updates, interview invitations, or application status changes, they will appear here in real time."
        />
      ) : (
        <div className="space-y-3 max-w-4xl">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                n.isRead === false
                  ? 'bg-white border-indigo-200 shadow-xs ring-1 ring-indigo-50'
                  : 'bg-white/80 border-slate-200 text-slate-700'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl border shrink-0 ${getBgForType(
                  n.type
                )}`}
              >
                {getIconForType(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {n.title}
                  </h4>
                  <span className="text-xs text-slate-400 shrink-0">
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {n.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default NotificationsPage;
