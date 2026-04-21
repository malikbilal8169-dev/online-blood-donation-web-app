import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/layout/Footer';

const BLOOD_TYPES = [
  { value: 'A+', label: 'TYPE A POSITIVE' },
  { value: 'A-', label: 'TYPE A NEGATIVE' },
  { value: 'B+', label: 'TYPE B POSITIVE' },
  { value: 'B-', label: 'TYPE B NEGATIVE' },
  { value: 'O+', label: 'TYPE O POSITIVE' },
  { value: 'O-', label: 'TYPE O NEGATIVE' },
  { value: 'AB+', label: 'TYPE AB POSITIVE' },
  { value: 'AB-', label: 'TYPE AB NEGATIVE' },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState('A+');

  React.useEffect(() => {
    if (user?.role === 'donor') navigate('/dashboard/donor', { replace: true });
    if (user?.role === 'receiver') navigate('/dashboard/receiver', { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">BL</span>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Blood<span className="text-primary">Life</span>
              </span>
            </Link>

            <div className="hidden sm:flex items-center gap-4">
              {user ? (
                <Link
                  to={user.role === 'donor' ? '/dashboard/donor' : '/dashboard/receiver'}
                  className="text-sm font-medium text-primary hover:text-primary-dark"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register/donor"
                    className="text-sm font-medium text-gray-700 hover:text-primary"
                  >
                    Donor 
                  </Link>
                  <Link
                    to="/register/receiver"
                    className="text-sm font-medium text-gray-700 hover:text-primary"
                  >
                    Receiver 
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark"
                  >
                    login
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-2 opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards', animationDuration: '0.2s' }}>
            {user ? (
              <Link
                to={user.role === 'donor' ? '/dashboard/donor' : '/dashboard/receiver'}
                className="block py-2 text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register/donor"
                  className="block py-2 text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Donor 
                </Link>
                <Link
                  to="/register/receiver"
                  className="block py-2 text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Receiver 
                </Link>
                <Link
                  to="/login"
                  className="block py-2 text-primary font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  login
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="w-full lg:w-1/2">
            <span className="inline-flex items-center rounded-full bg-red-50 text-primary px-3 py-1 text-xs font-semibold mb-4 opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards', animationDelay: '100ms' }}>
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary" />
              Urgent needs nearby
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards', animationDelay: '180ms' }}>
              Every Drop Counts.
              <span className="block text-primary">Save a Life Today.</span>
            </h1>
            <p className="mt-4 text-sm md:text-base text-gray-600 max-w-xl opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards', animationDelay: '260ms' }}>
              Real-time donor and receiver connection to bridge the gap in emergency blood needs.
              Join thousands of life-savers in your local community.
            </p>
            {!user && (
              <div className="mt-8 flex flex-col sm:flex-row gap-3 opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards', animationDelay: '340ms' }}>
                <Link
                  to="/register/donor"
                  className="inline-flex justify-center items-center px-6 py-3 rounded-lg bg-primary text-white text-sm font-semibold shadow-md shadow-red-200 hover:bg-primary-dark transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Register as Donor
                </Link>
                <Link
                  to="/register/receiver"
                  className="inline-flex justify-center items-center px-6 py-3 rounded-lg border border-red-200 bg-white text-primary text-sm font-semibold hover:bg-red-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Find Blood
                </Link>
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/2 opacity-0 animate-slide-in-right" style={{ animationFillMode: 'forwards', animationDelay: '220ms' }}>
            <div className="relative rounded-3xl bg-white shadow-xl shadow-red-100 overflow-hidden transition-transform duration-300 hover:shadow-2xl hover:shadow-red-100 hover:-translate-y-0.5">
              <div className="aspect-[4/3] sm:aspect-[5/4] bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1615461066159-fea0960485d5?q=80&w=1016&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Blood donation - giving blood saves lives"
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Select Your Blood Type */}
        <section className="mt-20 md:mt-28">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
            <span className="text-primary">*</span> DONOR REGISTRATION
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Select Your Blood Type
          </h2>
          <p className="mt-3 text-gray-600 text-sm md:text-base max-w-2xl">
            Accurate blood type identification is the first step in saving lives. Whether you are donating or requesting, knowing your type ensures compatibility and speeds up critical medical responses.
          </p>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {BLOOD_TYPES.map(({ value, label }, i) => {
              const isSelected = selectedBloodType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedBloodType(value)}
                  style={{ animationDelay: `${80 + i * 40}ms`, animationFillMode: 'forwards' }}
                  className={`relative rounded-xl border-2 bg-white p-5 text-left shadow-sm opacity-0 animate-fade-in-up transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                    isSelected
                      ? 'border-primary text-primary'
                      : 'border-gray-200 text-gray-800 hover:border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                  <span className={`block text-2xl font-bold ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                    {value}
                  </span>
                  <span className="mt-1 block text-xs font-medium text-gray-500">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
          {!user && (
            <div className="mt-6">
              <Link
                to="/register/donor"
                state={selectedBloodType ? { bloodGroup: selectedBloodType } : undefined}
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white text-sm font-semibold shadow-md hover:bg-primary-dark transition-colors"
              >
                Continue to Donor Registration
              </Link>
            </div>
          )}
        </section>

        {/* How BloodLife Works */}
        <section className="mt-20 md:mt-28 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            How BloodLife Works
          </h2>
          <p className="mt-3 text-gray-600 text-sm md:text-base max-w-xl mx-auto">
            Connecting heroes with those in need through a seamless digital ecosystem.
          </p>
          <div className="mt-10 grid sm:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-[#F8F8F8] rounded-2xl p-6 text-left shadow-sm opacity-0 animate-fade-in-up transition-shadow duration-300 hover:shadow-md" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <div className="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center text-white mb-4">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Register</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Easy sign-up process for Donors & Receivers. Build your profile, select your blood group, and set your location in under 2 minutes.
              </p>
              <Link
                to="/register/donor"
                className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary hover:text-primary-dark"
              >
                
              </Link>
            </div>
            <div className="bg-[#F8F8F8] rounded-2xl p-6 text-left shadow-sm opacity-0 animate-fade-in-up transition-shadow duration-300 hover:shadow-md" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <div className="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center text-white mb-4">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Find Matching Blood</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Our smart matching algorithm uses location-based services to find compatible donors near you instantly during critical times.
              </p>
              <Link
                to="/register/receiver"
                className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary hover:text-primary-dark"
              >
                
              </Link>
            </div>
            <div className="bg-[#F8F8F8] rounded-2xl p-6 text-left shadow-sm opacity-0 animate-fade-in-up transition-shadow duration-300 hover:shadow-md" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
              <div className="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center text-white mb-4">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Emergency Response</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Broadcast instant SOS alerts to nearby compatible donors. Receive real-time updates and contact details within seconds.
              </p>
              <Link
                to="/dashboard/receiver"
                className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary hover:text-primary-dark"
              >
                
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
