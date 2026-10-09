import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';
import Button from '../../components/common/Button';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Compass className="w-9 h-9" />
          </div>

          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            404 Error
          </span>

          <h1 className="text-2xl font-extrabold text-slate-900 mt-2 mb-3">
            Page Not Found
          </h1>

          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            The page you are looking for might have been moved, removed, or never existed in the first place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full flex items-center gap-2">
                <Home className="w-4 h-4" />
                Go to Homepage
              </Button>
            </Link>
            <Link to="/jobs" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Jobs
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFoundPage;
