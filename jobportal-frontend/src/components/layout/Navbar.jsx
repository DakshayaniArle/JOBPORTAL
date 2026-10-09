import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useNotifications from '../../hooks/useNotifications';
import { ROLES } from '../../utils/constants';
import { 
  Briefcase, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  Bookmark, 
  FileText, 
  PlusCircle, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { unreadCount, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (role === ROLES.ADMIN) return '/admin/dashboard';
    if (role === ROLES.RECRUITER) return '/recruiter/dashboard';
    return '/candidate/dashboard';
  };

  const getNotificationsLink = () => {
    if (role === ROLES.ADMIN) return '/admin/notifications';
    if (role === ROLES.RECRUITER) return '/recruiter/notifications';
    return '/candidate/notifications';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 leading-tight">
                Work<span className="text-indigo-600">Bridge</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none">
                Job Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link to="/jobs" className="hover:text-indigo-600 transition-colors">
              Find Jobs
            </Link>

            {isAuthenticated && role === ROLES.USER && (
              <>
                <Link to="/candidate/recommended-jobs" className="hover:text-indigo-600 transition-colors">
                  Recommended
                </Link>
                <Link to="/candidate/applications" className="hover:text-indigo-600 transition-colors">
                  Applications
                </Link>
                <Link to="/candidate/saved-jobs" className="hover:text-indigo-600 transition-colors">
                  Saved Jobs
                </Link>
              </>
            )}

            {isAuthenticated && role === ROLES.RECRUITER && (
              <>
                <Link to="/recruiter/jobs" className="hover:text-indigo-600 transition-colors">
                  My Jobs
                </Link>
                <Link to="/recruiter/interviews" className="hover:text-indigo-600 transition-colors">
                  Interviews
                </Link>
                <Link
                  to="/recruiter/post-job"
                  className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-bold"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post a Job
                </Link>
              </>
            )}

            {isAuthenticated && role === ROLES.ADMIN && (
              <>
                <Link to="/admin/users" className="hover:text-indigo-600 transition-colors">
                  Users
                </Link>
                <Link to="/admin/jobs" className="hover:text-indigo-600 transition-colors">
                  Jobs Catalog
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Icons & User Profile */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <Link
                  to={getNotificationsLink()}
                  onClick={() => markAllAsRead?.()}
                  className="relative p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-100">
                      {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-xs font-bold text-slate-800 leading-tight line-clamp-1">{user?.name || 'My Account'}</p>
                      <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">{role}</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>

                        <Link
                          to={getDashboardLink()}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>

                        {role === ROLES.USER && (
                          <Link
                            to="/candidate/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <User className="w-4 h-4" />
                            My Profile
                          </Link>
                        )}

                        {role === ROLES.RECRUITER && (
                          <Link
                            to="/recruiter/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <User className="w-4 h-4" />
                            Company Profile
                          </Link>
                        )}

                        <div className="border-t border-slate-100 my-1"></div>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Candidate Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  Join Free
                </Link>
                <div className="h-4 w-px bg-slate-200" />
                <Link
                  to="/recruiter/login"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Recruiter Portal
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center md:hidden gap-2">
            {isAuthenticated && (
              <Link
                to={getNotificationsLink()}
                onClick={() => markAllAsRead?.()}
                className="relative p-2 rounded-lg text-slate-600"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            Find Jobs
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                Dashboard
              </Link>
              {role === ROLES.USER && (
                <>
                  <Link
                    to="/candidate/recommended-jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Recommended Jobs
                  </Link>
                  <Link
                    to="/candidate/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Applications
                  </Link>
                  <Link
                    to="/candidate/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Profile
                  </Link>
                </>
              )}
              {role === ROLES.RECRUITER && (
                <>
                  <Link
                    to="/recruiter/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Job Listings
                  </Link>
                  <Link
                    to="/recruiter/post-job"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-indigo-600 hover:bg-indigo-50"
                  >
                    + Post New Job
                  </Link>
                  <Link
                    to="/recruiter/interviews"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Scheduled Interviews
                  </Link>
                  <Link
                    to="/recruiter/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Company Profile
                  </Link>
                </>
              )}
              {role === ROLES.ADMIN && (
                <>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    User Management
                  </Link>
                  <Link
                    to="/admin/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Job Listings Catalog
                  </Link>
                </>
              )}
              <div className="border-t border-slate-100 pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-base font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 rounded-xl text-sm font-bold text-slate-700 border border-slate-200"
              >
                Candidate Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 shadow-xs"
              >
                Create Candidate Account
              </Link>
              <Link
                to="/recruiter/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 text-xs font-semibold text-slate-500"
              >
                Recruiter Portal Access →
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

