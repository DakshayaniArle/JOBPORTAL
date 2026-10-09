import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const DashboardLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {title && (
            <div className="mb-6 border-b border-slate-200 pb-4 hidden sm:block">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;

