import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { donors, requests as requestsApi } from '../lib/api';
import AvailabilityToggle from '../components/donor/AvailabilityToggle';
import DonorProfileForm from '../components/donor/DonorProfileForm';
import { useSocket } from '../hooks/useSocket';
import Footer from '../components/layout/Footer';

const navItems = [
  { id: 'overview', label: 'Overview', icon: 'overview' },
  { id: 'profile', label: 'Profile', icon: 'profile' },
  { id: 'requests', label: 'Requests', icon: 'requests' },
  { id: 'history', label: 'History', icon: 'history' },
];

function NavIcon({ name, className }) {
  const c = className || 'h-5 w-5';
  if (name === 'overview') {
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    );
  }
  if (name === 'profile') {
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
  }
  if (name === 'requests') {
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    );
  }
  if (name === 'history') {
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  return null;
}

function DonorSidebar({ active, onSelect, onSignOut }) {
  return (
    <aside className="hidden md:flex md:w-60 xl:w-72 flex-col bg-white border-r border-gray-200 shadow-sm">
      <div className="h-16 flex items-center px-5 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white text-xs font-bold">BL</span>
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-gray-900">Blood<span className="text-primary">Life</span></p>
            <p className="text-[11px] text-gray-500 font-medium">Donor Dashboard</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              active === id
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <NavIcon name={icon} className={`h-4 w-4 shrink-0 ${active === id ? 'text-primary' : 'text-gray-500'}`} />
            {label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onSignOut}
          className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default function DonorDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [incoming, setIncoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { socket, connected } = useSocket(token);

  const fetchIncoming = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const list = await requestsApi.listIncoming();
      setIncoming(list);
    } catch (err) {
      setIncoming([]);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const list = await donors.getHistory();
      setHistory(list);
    } catch (err) {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'overview' || tab === 'requests') fetchIncoming();
  }, [tab, fetchIncoming]);

  useEffect(() => {
    if (tab === 'history') fetchHistory();
  }, [tab, fetchHistory]);

  useEffect(() => {
    if (!socket) return;
    const onNew = () => fetchIncoming();
    socket.on('new-request', onNew);
    return () => socket.off('new-request', onNew);
  }, [socket, fetchIncoming]);

  const handleAccept = async (requestId) => {
    try {
      await requestsApi.accept(requestId);
      fetchIncoming();
    } catch (err) {
      alert(err.message || 'Failed to accept');
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DonorSidebar active={tab} onSelect={setTab} onSignOut={handleSignOut} />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 md:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white text-xs font-bold">BL</span>
              </div>
              <p className="text-sm font-bold text-gray-900">Blood<span className="text-primary">Life</span></p>
            </Link>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            {connected && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            )}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm font-semibold">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 truncate max-w-[140px]">{user?.name}</span>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm font-medium text-gray-500 hover:text-primary transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-auto bg-gray-50/80">
          {tab === 'overview' && (
            <div className="space-y-6 max-w-4xl opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }} key="overview">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h1>
                <p className="text-sm text-gray-500">Manage your availability and respond to requests.</p>
              </div>
              <AvailabilityToggle />
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <NavIcon name="requests" className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Incoming Requests</h2>
                      <p className="text-xs text-gray-500">Nearest receiver requests in your city. Accept to share your contact.</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  {loadingRequests ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 py-8 justify-center">
                      <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading...
                    </div>
                  ) : (
                    <IncomingList list={incoming} onAccept={handleAccept} />
                  )}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">90-Day Cooldown</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                  After each donation your profile is auto-disabled for 90 days. Use the toggle above when you’re ready again.
                </p>
                </div>
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div className="max-w-xl opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }} key="profile">
              <h1 className="text-xl font-bold text-gray-900 mb-4">Profile</h1>
              <DonorProfileForm onDeleted={handleSignOut} />
            </div>
          )}

          {tab === 'requests' && (
            <div className="max-w-4xl opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }} key="requests">
              <h1 className="text-xl font-bold text-gray-900 mb-4">Incoming Requests</h1>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <p className="text-sm text-gray-500">Accept a request to share your contact with the receiver.</p>
                </div>
                <div className="p-5">
                  {loadingRequests ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 py-8 justify-center">
                      <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading...
                    </div>
                  ) : (
                    <IncomingList list={incoming} onAccept={handleAccept} />
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'history' && (
            <div className="max-w-4xl opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }} key="history">
              <h1 className="text-xl font-bold text-gray-900 mb-4">Donation History</h1>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5">
                  {loadingHistory ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 py-8 justify-center">
                      <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading...
                    </div>
                  ) : history.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex h-14 w-14 rounded-2xl bg-gray-100 items-center justify-center mb-3">
                        <NavIcon name="history" className="h-7 w-7 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No donations yet</p>
                      <p className="text-sm text-gray-400 mt-1">Your completed donations will appear here.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {history.map((h, i) => (
                        <li
                          key={h.id}
                          style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
                          className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0 opacity-0 animate-fade-in-up"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-primary font-semibold text-sm">{h.bloodGroup}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{h.receiverName}</p>
                              <p className="text-sm text-gray-500">{h.city}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {h.ratingGiven != null && (
                              <span className="inline-flex items-center gap-0.5 text-amber-500 text-sm font-medium">
                                ★ {h.ratingGiven}
                              </span>
                            )}
                            <span className="text-sm text-gray-400">
                              {h.completedAt ? new Date(h.completedAt).toLocaleDateString() : ''}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </main>
    </div>
  );
}

function IncomingList({ list, onAccept }) {
  if (!list || list.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex h-12 w-12 rounded-xl bg-gray-100 items-center justify-center mb-2">
          <NavIcon name="requests" className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 font-medium">No pending requests in your area</p>
        <p className="text-xs text-gray-400 mt-0.5">New requests will appear here when they match your city and blood group.</p>
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {list.map((r, i) => (
        <li
          key={r.id}
          style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}
          className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-gray-200 opacity-0 animate-fade-in-up transition-all duration-200 hover:shadow-sm"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0">
              <span className="text-primary font-semibold text-sm">{r.bloodGroup}</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">{r.receiver?.name || 'Receiver'}</p>
              <p className="text-sm text-gray-500">{r.city}</p>
              {r.isEmergency && (
                <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-lg">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Emergency
                </span>
              )}
              {r.message && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.message}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onAccept(r.id)}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Accept
          </button>
        </li>
      ))}
    </ul>
  );
}
