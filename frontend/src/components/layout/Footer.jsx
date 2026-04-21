import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#111827] text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-gray-800">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-sm font-bold">BL</span>
              </div>
              <span className="text-sm font-semibold text-white tracking-tight">
                Blood<span className="text-primary">Life</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
              Connecting life‑savers with those in need. Empowering communities
              through blood donation technology.
            </p>
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                className="h-7 w-7 rounded-full border border-gray-600 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
              >
                🌐
              </button>
              <button
                type="button"
                className="h-7 w-7 rounded-full border border-gray-600 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
              >
                ↗
              </button>
              <button
                type="button"
                className="h-7 w-7 rounded-full border border-gray-600 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
              >
                ✉
              </button>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <h3 className="text-xs font-semibold tracking-wide text-gray-200 uppercase">
              Quick Links
            </h3>
            <nav className="space-y-1">
              <Link
                to="/receivers/search"
                className="block text-xs text-gray-400 hover:text-white"
              >
                Find Donors
              </Link>
              <Link
                to="/register/donor"
                className="block text-xs text-gray-400 hover:text-white"
              >
                Register as Donor
              </Link>
              <Link
                to="/"
                className="block text-xs text-gray-400 hover:text-white"
              >
                Blood Banks
              </Link>
              <Link
                to="/dashboard/receiver"
                className="block text-xs text-gray-400 hover:text-white"
              >
                Emergency Requests
              </Link>
            </nav>
          </div>

          <div className="space-y-3 text-sm">
            <h3 className="text-xs font-semibold tracking-wide text-gray-200 uppercase">
              Support
            </h3>
            <div className="space-y-1">
              <button
                type="button"
                className="block text-left text-xs text-gray-400 hover:text-white w-full"
              >
                Help Center
              </button>
              <button
                type="button"
                className="block text-left text-xs text-gray-400 hover:text-white w-full"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                className="block text-left text-xs text-gray-400 hover:text-white w-full"
              >
                Terms of Service
              </button>
              <button
                type="button"
                className="block text-left text-xs text-gray-400 hover:text-white w-full"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-500">
          <p>© {year} BloodLife. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="hover:text-gray-300"
            >
              Cookie Settings
            </button>
            <button
              type="button"
              className="hover:text-gray-300"
            >
              Security
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}


