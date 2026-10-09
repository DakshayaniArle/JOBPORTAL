import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Work<span className="text-indigo-400">Bridge</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering talented job seekers and high-growth employers with seamless career opportunities and automated hiring pipelines.
            </p>
          </div>

          {/* Candidates */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">For Candidates</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/jobs" className="hover:text-white transition-colors">
                  Browse Job Listings
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Candidate Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Create Free Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Recruiters */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">For Employers</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/recruiter/login" className="hover:text-white transition-colors">
                  Recruiter Sign In
                </Link>
              </li>
              <li>
                <Link to="/recruiter/register" className="hover:text-white transition-colors">
                  Post Jobs & Hire Talent
                </Link>
              </li>
            </ul>
          </div>

          {/* System info */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">System & Tech</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Production ready Spring Boot 3 + React + Vite + Tailwind CSS architecture.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Backend Connected (:8081)</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} WorkBridge Job Portal. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/jobs" className="hover:text-white">Jobs</Link>
            <Link to="/login" className="hover:text-white">Sign In</Link>
            <Link to="/recruiter/login" className="hover:text-white">Recruiters</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

