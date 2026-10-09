import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useNotifications from '../../hooks/useNotifications';
import { ROLES } from '../../utils/constants';
import {
  LayoutDashboard,
  Briefcase,
  FileCheck2,
  Bookmark,
  Calendar,
  User,
  PlusCircle,
  Users,
  ShieldCheck,
  Bell,
  Lock,
  Compass
} from 'lucide-react';

const Sidebar = () => {
  const { role, user } = useAuth();
  const { unreadCount, markAllAsRead } = useNotifications();

  const getCandidateNav = () => [
    { name: 'Dashboard', path: '/candidate/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Recommended Jobs', path: '/candidate/recommended-jobs', icon: <Compass className="w-4 h-4" /> },
    { name: 'Browse Jobs', path: '/jobs', icon: <Briefcase className="w-4 h-4" /> },
    { name: 'My Applications', path: '/candidate/applications', icon: <FileCheck2 className="w-4 h-4" /> },
    { name: 'Saved Jobs', path: '/candidate/saved-jobs', icon: <Bookmark className="w-4 h-4" /> },
    { name: 'My Interviews', path: '/candidate/interviews', icon: <Calendar className="w-4 h-4" /> },
    { name: 'Profile & Resume', path: '/candidate/profile', icon: <User className="w-4 h-4" /> },
    { name: 'Notifications', path: '/candidate/notifications', icon: <Bell className="w-4 h-4" />, badge: unreadCount },
    { name: 'Change Password', path: '/candidate/change-password', icon: <Lock className="w-4 h-4" /> },
  ];

  const getRecruiterNav = () => [
    { name: 'Recruiter Dashboard', path: '/recruiter/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Post New Job', path: '/recruiter/post-job', icon: <PlusCircle className="w-4 h-4" /> },
    { name: 'My Job Listings', path: '/recruiter/jobs', icon: <Briefcase className="w-4 h-4" /> },
    { name: 'Scheduled Interviews', path: '/recruiter/interviews', icon: <Calendar className="w-4 h-4" /> },
    { name: 'Company Profile', path: '/recruiter/profile', icon: <User className="w-4 h-4" /> },
    { name: 'Notifications', path: '/recruiter/notifications', icon: <Bell className="w-4 h-4" />, badge: unreadCount },
  ];

  const getAdminNav = () => [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'User Management', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { name: 'Job Listings Catalog', path: '/admin/jobs', icon: <Briefcase className="w-4 h-4" /> },
    { name: 'System Notifications', path: '/admin/notifications', icon: <Bell className="w-4 h-4" />, badge: unreadCount },
  ];

  let navItems = getCandidateNav();
  if (role === ROLES.RECRUITER) navItems = getRecruiterNav();
  if (role === ROLES.ADMIN) navItems = getAdminNav();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 hidden md:block min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1">
        <div className="px-3 py-2 mb-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {role === ROLES.ADMIN ? 'Administration' : role === ROLES.RECRUITER ? 'Recruiter Menu' : 'Candidate Menu'}
          </p>
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (item.path.includes('notifications')) {
                markAllAsRead?.();
              }
            }}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <span className="shrink-0">{item.icon}</span>
              <span>{item.name}</span>
            </div>
            {item.badge > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;

