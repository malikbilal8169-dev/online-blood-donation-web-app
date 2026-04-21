import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { receivers, requests as requestsApi } from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import Footer from '../components/layout/Footer';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
];

const receiverNavItems = [
  { id: 'search', label: 'Search', icon: 'search' },
  { id: 'my-request', label: 'My request', icon: 'request' },
  { id: 'history', label: 'History', icon: 'history' },
];

function ReceiverNavIcon({ name, active }) {
  const c = 'h-5 w-5 ' + (active ? 'text-primary' : 'text-gray-500');
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
  if (name === 'search') {
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    );
  }
  if (name === 'request') {
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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

function ReceiverSidebar({ active, onSelect, onSignOut }) {
  return (
    <aside className="hidden md:flex md:w-60 xl:w-72 flex-col bg-white border-r border-gray-200 shadow-sm">
      <div className="h-16 flex items-center px-5 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white text-xs font-bold">BL</span>
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-gray-900">Blood<span className="text-primary">Life</span></p>
            <p className="text-[11px] text-gray-500 font-medium">Receiver Dashboard</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {receiverNavItems.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              active === id ? 'bg-primary/10 text-primary shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <ReceiverNavIcon name={icon} active={active === id} />
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
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default function ReceiverDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('search');
  const [city, setCity] = useState('');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || '');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [myRequest, setMyRequest] = useState({ active: null, history: [] });
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [requestForm, setRequestForm] = useState({
    city: '',
    bloodGroup: user?.bloodGroup || '',
    message: '',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [ratingModal, setRatingModal] = useState(null);
  const [documentDataUrl, setDocumentDataUrl] = useState('');
  const { socket, connected } = useSocket(token);

  const fetchMyRequest = useCallback(async () => {
    setLoadingRequest(true);
    try {
      const data = await receivers.getMyRequests();
      setMyRequest({ active: data.active, history: data.history || [] });
    } catch (err) {
      setMyRequest({ active: null, history: [] });
    } finally {
      setLoadingRequest(false);
    }
  }, []);

  useEffect(() => {
    if (user?.bloodGroup) setBloodGroup(user.bloodGroup);
  }, [user?.bloodGroup]);

  useEffect(() => {
    fetchMyRequest();
  }, [fetchMyRequest]);

  useEffect(() => {
    if (!socket) return;
    const onAccepted = () => fetchMyRequest();
    socket.on('request-accepted', onAccepted);
    return () => socket.off('request-accepted', onAccepted);
  }, [socket, fetchMyRequest]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!city.trim() || !bloodGroup) {
      setError('Enter city and blood group');
      return;
    }
    if (!documentDataUrl) {
      setError('Please upload a medical report (image or PDF) before searching.');
      return;
    }
    setSearching(true);
    setError('');
    try {
      const list = await receivers.search(city.trim(), bloodGroup);
      setSearchResults(list);
    } catch (err) {
      setError(err.message || 'Search failed');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateRequest = async (isEmergency = false) => {
    const { city: c, bloodGroup: bg, message } = requestForm;
    if (!c || !bg) {
      setError('City and blood group required');
      return;
    }
    if (isEmergency && !documentDataUrl) {
      setError('Please upload a medical document (image or PDF) for emergency SOS.');
      return;
    }
    setError('');
    if (isEmergency) setSosLoading(true);
    else setCreating(true);
    try {
      const payload = {
        city: c,
        bloodGroup: bg,
        message: message || undefined,
        isEmergency,
      };
      if (isEmergency && documentDataUrl) {
        payload.documentUrl = documentDataUrl;
      }
      const res = await receivers.createRequest(payload);
      if (res.frequencyWarning) {
        setError(res.frequencyWarning);
      }
      setRequestForm((f) => ({ ...f, city: '', message: '' }));
      setDocumentDataUrl('');
      await fetchMyRequest();
      setTab('my-request');
    } catch (err) {
      setError(err.message || 'Failed to create request');
    } finally {
      setSosLoading(false);
      setCreating(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Cancel this request?')) return;
    try {
      await requestsApi.cancel(requestId);
      fetchMyRequest();
    } catch (err) {
      setError(err.message || 'Failed to cancel');
    }
  };

  const handleComplete = async (requestId) => {
    try {
      await requestsApi.complete(requestId);
      fetchMyRequest();
    } catch (err) {
      setError(err.message || 'Failed to complete');
    }
  };

  const handleRate = async (requestId, rating) => {
    try {
      await requestsApi.rate(requestId, rating);
      setRatingModal(null);
      fetchMyRequest();
    } catch (err) {
      setError(err.message || 'Failed to submit rating');
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const active = myRequest.active;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ReceiverSidebar active={tab} onSelect={setTab} onSignOut={handleSignOut} />

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
                <span className="text-primary text-sm font-semibold">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-sm font-medium text-gray-700 truncate max-w-[140px]">{user?.name}</span>
            </div>
            <button type="button" onClick={handleSignOut} className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">
              Sign out
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-auto bg-gray-50/80">
          {error && (
            <div className="mb-4 flex items-center justify-between text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <span>{error}</span>
              <button type="button" onClick={() => setError('')} className="font-medium text-red-800 hover:underline shrink-0 ml-2">Dismiss</button>
            </div>
          )}

          {tab === 'overview' && (
            <div className="space-y-6 max-w-3xl opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }} key="overview">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">Get Blood Support</h1>
                <p className="text-sm text-gray-500">
                  Search for available donors or send an emergency alert to your city.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ReceiverNavIcon name="search" active />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Request Center</h2>
                    <p className="text-xs text-gray-600">
                      Choose city, blood group, and optionally upload a hospital requisition to get help quickly.
                    </p>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
                    <div className="md:flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                      <select
                        value={requestForm.city}
                        onChange={(e) => {
                          const value = e.target.value;
                          setRequestForm((f) => ({ ...f, city: value }));
                          setCity(value);
                        }}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="">Select city</option>
                        {CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Blood group</label>
                      <select
                        value={requestForm.bloodGroup}
                        onChange={(e) => {
                          const value = e.target.value;
                          setRequestForm((f) => ({ ...f, bloodGroup: value }));
                          setBloodGroup(value);
                        }}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="">Select</option>
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Upload Hospital Requisition (Image/PDF)
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setDocumentDataUrl(reader.result || '');
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="block text-xs text-gray-600"
                      />
                    </div>
                  </div>
                  {active ? (
                    <p className="mt-1 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                      You have an active request. Complete or cancel it first.
                    </p>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3 mt-1">
                      <button
                        type="button"
                        disabled={searching}
                        onClick={() => handleSearch()}
                        className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-60 shadow-sm transition-colors"
                      >
                        {searching ? 'Searching...' : 'Search Donors'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCreateRequest(true)}
                        disabled={sosLoading || !documentDataUrl}
                        className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl bg-red-100 text-red-700 text-sm font-semibold hover:bg-red-200 disabled:opacity-50 shadow-sm transition-colors"
                      >
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 mr-2 animate-pulse" />
                        {sosLoading ? 'Sending SOS...' : 'Send Emergency SOS'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-base font-semibold text-gray-900">Matching donors</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Found {searchResults.length} donor{searchResults.length === 1 ? '' : 's'} for your filters.
                    </p>
                  </div>
                  <div className="p-5">
                    <ul className="space-y-2">
                      {searchResults.map((d, i) => (
                        <li
                          key={d.id}
                          style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
                          className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:border-gray-200 opacity-0 animate-fade-in-up transition-all duration-200 hover:shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-primary font-semibold text-sm">{d.bloodGroup}</span>
                            </div>
                            <span className="font-semibold text-gray-900">{d.name}</span>
                            <span className="text-sm text-gray-500">{d.city}</span>
                          </div>
                          {d.averageRating != null && (
                            <span className="inline-flex items-center gap-0.5 text-amber-500 text-sm font-medium">
                              ★ {d.averageRating}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {active && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-base font-semibold text-gray-900">Your active request</h2>
                  </div>
                  <div className="p-5">
                    <ActiveRequestCard
                      request={active}
                      onCancel={handleCancelRequest}
                      onComplete={handleComplete}
                      onRate={handleRate}
                      setRatingModal={setRatingModal}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'search' && (
            <div className="max-w-3xl opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }} key="search">
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 mb-1">Get Blood Support</h1>
                  <p className="text-sm text-gray-500">
                    Search for available donors or send an emergency alert to your city.
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
                      <div className="md:flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                        <select
                          value={city}
                          onChange={(e) => {
                            const value = e.target.value;
                            setCity(value);
                            setRequestForm((f) => ({ ...f, city: value }));
                          }}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="">Select city</option>
                          {CITIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Blood group</label>
                        <select
                          value={bloodGroup}
                          onChange={(e) => {
                            const value = e.target.value;
                            setBloodGroup(value);
                            setRequestForm((f) => ({ ...f, bloodGroup: value }));
                          }}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="">Select</option>
                          {BLOOD_GROUPS.map((bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Medical report (optional, image/PDF)
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setDocumentDataUrl(reader.result || '');
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="block text-xs text-gray-600"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 md:w-56">
                        <button
                          type="submit"
                          disabled={searching}
                          className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-60 shadow-sm transition-colors"
                        >
                          {searching ? 'Searching...' : 'Search Donors'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCreateRequest(true)}
                          disabled={sosLoading || !requestForm.city || !requestForm.bloodGroup || !documentDataUrl}
                          className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 disabled:opacity-50 shadow-sm transition-colors"
                        >
                          <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-pulse" />
                          {sosLoading ? 'Sending SOS...' : 'Emergency SOS'}
                        </button>
                      </div>
                    </form>
                  </div>
                  <div className="p-5">
                    {searchResults.length === 0 && !searching && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="inline-flex h-12 w-12 rounded-xl bg-gray-100 items-center justify-center mb-3">
                          <ReceiverNavIcon name="search" active={false} />
                        </div>
                        <p className="text-sm font-medium">Select city and blood group, then click Search Donors.</p>
                      </div>
                    )}
                    {searchResults.length > 0 && (
                      <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-gray-900 mb-1">
                          Matching donors
                        </h2>
                        <ul className="space-y-2">
                          {searchResults.map((d, i) => (
                            <li
                              key={d.id}
                              style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
                              className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:border-gray-200 opacity-0 animate-fade-in-up transition-all duration-200 hover:shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                  <span className="text-primary font-semibold text-sm">{d.bloodGroup}</span>
                                </div>
                                <span className="font-semibold text-gray-900">{d.name}</span>
                                <span className="text-sm text-gray-500">{d.city}</span>
                              </div>
                              {d.averageRating != null && (
                                <span className="inline-flex items-center gap-0.5 text-amber-500 text-sm font-medium">
                                  ★ {d.averageRating}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                {searchResults.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                      <h2 className="text-base font-semibold text-gray-900">Matching donors</h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Found {searchResults.length} donor{searchResults.length === 1 ? '' : 's'} for your filters.
                      </p>
                    </div>
                    <div className="p-5">
                      <ul className="space-y-2">
                        {searchResults.map((d, i) => (
                          <li
                            key={d.id}
                            style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
                            className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:border-gray-200 opacity-0 animate-fade-in-up transition-all duration-200 hover:shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-primary font-semibold text-sm">{d.bloodGroup}</span>
                              </div>
                              <span className="font-semibold text-gray-900">{d.name}</span>
                              <span className="text-sm text-gray-500">{d.city}</span>
                            </div>
                            {d.averageRating != null && (
                              <span className="inline-flex items-center gap-0.5 text-amber-500 text-sm font-medium">
                                ★ {d.averageRating}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'my-request' && (
            <div className="max-w-3xl space-y-6 opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }} key="my-request">
              <h1 className="text-xl font-bold text-gray-900">My request</h1>
              {loadingRequest ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-8 justify-center bg-white rounded-2xl border border-gray-100 p-8">
                  <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading...
                </div>
              ) : active ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5">
                    <ActiveRequestCard
                      request={active}
                      onCancel={handleCancelRequest}
                      onComplete={handleComplete}
                      onRate={handleRate}
                      setRatingModal={setRatingModal}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-gray-500 mb-4">No active request.</p>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Create request</h3>
                  <div className="flex flex-wrap gap-3 items-end">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                      <select
                        value={requestForm.city}
                        onChange={(e) => setRequestForm((f) => ({ ...f, city: e.target.value }))}
                        className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm w-40 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="">Select city</option>
                        {CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Blood group</label>
                      <select
                        value={requestForm.bloodGroup}
                        onChange={(e) => setRequestForm((f) => ({ ...f, bloodGroup: e.target.value }))}
                        className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="">Select</option>
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Message (optional)</label>
                      <input
                        type="text"
                        value={requestForm.message}
                        onChange={(e) => setRequestForm((f) => ({ ...f, message: e.target.value }))}
                        placeholder="Message"
                        className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm w-48 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCreateRequest(false)}
                      disabled={creating}
                      className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-60 shadow-sm transition-colors"
                    >
                      {creating ? 'Creating...' : 'Create request'}
                    </button>
                  </div>
                </div>
              )}
              {myRequest.history?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-sm font-semibold text-gray-900">Past requests</h3>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {myRequest.history.map((r) => (
                      <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3 px-5 text-sm">
                        <span className="font-medium text-gray-900">{r.bloodGroup} · {r.city}</span>
                        <span className="text-gray-500 capitalize">{r.status}</span>
                        <div className="flex items-center gap-2">
                          {r.status === 'completed' && r.ratingGiven == null && (
                            <button
                              type="button"
                              onClick={() => setRatingModal(r)}
                              className="text-primary text-xs font-semibold hover:underline"
                            >
                              Rate donor
                            </button>
                          )}
                          {r.ratingGiven != null && <span className="text-amber-500 font-medium">★ {r.ratingGiven}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {tab === 'history' && (
            <div className="max-w-3xl opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }} key="history">
              <h1 className="text-xl font-bold text-gray-900 mb-4">Request history</h1>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5">
                  {loadingRequest ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 py-8 justify-center">
                      <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading...
                    </div>
                  ) : myRequest.history?.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex h-14 w-14 rounded-2xl bg-gray-100 items-center justify-center mb-3">
                        <ReceiverNavIcon name="history" active={false} />
                      </div>
                      <p className="text-gray-500 font-medium">No past requests</p>
                      <p className="text-sm text-gray-400 mt-1">Your request history will appear here.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {myRequest.history.map((r, i) => (
                        <li key={r.id} style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0 opacity-0 animate-fade-in-up">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-primary font-semibold text-sm">{r.bloodGroup}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{r.bloodGroup} · {r.city}</p>
                              <p className="text-xs text-gray-500">{r.status} · {r.donor?.name}</p>
                            </div>
                          </div>
                          {r.status === 'completed' && (
                            r.ratingGiven != null ? (
                              <span className="text-amber-500 font-medium">★ {r.ratingGiven}</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setRatingModal(r)}
                                className="text-sm text-primary font-semibold hover:underline"
                              >
                                Rate donor
                              </button>
                            )
                          )}
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

      {ratingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 opacity-0 animate-fade-in" onClick={() => setRatingModal(null)} style={{ animationFillMode: 'forwards', animationDuration: '0.2s' }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full border border-gray-100 opacity-0 animate-scale-in-bounce" onClick={(e) => e.stopPropagation()} style={{ animationFillMode: 'forwards' }}>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Rate this donor</h3>
            <p className="text-sm text-gray-500 mb-5">How was your experience?</p>
            <div className="flex gap-2 justify-center mb-6">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRate(ratingModal.id, rating)}
                  className="w-11 h-11 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 text-lg font-medium text-amber-500 transition-colors focus:ring-2 focus:ring-primary/30 focus:outline-none"
                >
                  ★
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setRatingModal(null)}
              className="w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ActiveRequestCard({ request, onCancel, onComplete, onRate, setRatingModal }) {
  const donor = request.donor;
  const canComplete = request.status === 'accepted';
  const isCompleted = request.status === 'completed';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-semibold text-sm">{request.bloodGroup}</span>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{request.bloodGroup} · {request.city}</p>
          <p className="text-xs text-gray-500 capitalize">Status: {request.status}</p>
        </div>
        {request.isEmergency && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-lg ml-auto">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Emergency
          </span>
        )}
      </div>
      {donor && (
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <p className="font-semibold text-gray-900">{donor.name}</p>
          <p className="text-sm text-gray-500">{donor.bloodGroup} · {donor.city}</p>
          {donor.phone && (
            <p className="text-sm font-semibold text-primary mt-2">Phone: {donor.phone}</p>
          )}
          {donor.averageRating != null && (
            <p className="text-xs text-gray-500 mt-1">★ {donor.averageRating} ({donor.ratingCount} ratings)</p>
          )}
        </div>
      )}
      {!isCompleted && (
        <div className="flex flex-wrap gap-2">
          {canComplete && (
            <button
              type="button"
              onClick={() => onComplete(request.id)}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark shadow-sm transition-colors"
            >
              Mark as completed
            </button>
          )}
          {request.status !== 'completed' && (
            <button
              type="button"
              onClick={() => onCancel(request.id)}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel request
            </button>
          )}
        </div>
      )}
      {isCompleted && request.ratingGiven == null && (
        <button
          type="button"
          onClick={() => setRatingModal(request)}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Rate this donor
        </button>
      )}
      {isCompleted && request.ratingGiven != null && (
        <p className="text-sm text-gray-600">You rated <span className="text-amber-500 font-medium">★ {request.ratingGiven}</span></p>
      )}
    </div>
  );
}
