import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { admin as adminApi } from '../lib/api';
import Footer from '../components/layout/Footer';

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold text-gray-900">{value}</span>
    </div>
  );
}

function AdminUserAudit() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const list = await adminApi.listUsers();
        setUsers(list);
      } catch (err) {
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleBlock = async (user) => {
    try {
      setUpdatingId(user.id);
      const updated = await adminApi.updateUserFlags(user.id, {
        isBlocked: !user.isBlocked,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
      );
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading users...</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
        {error}
      </p>
    );
  }

  if (!users.length) {
    return <p className="text-sm text-gray-500">No users found.</p>;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-3 py-2 text-left font-medium">User</th>
              <th className="px-3 py-2 text-left font-medium">Role</th>
              <th className="px-3 py-2 text-left font-medium">Requests (30d)</th>
              <th className="px-3 py-2 text-left font-medium">IP / Registered</th>
              <th className="px-3 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-3 py-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{u.name}</span>
                    <span className="text-xs text-gray-500">{u.email}</span>
                  </div>
                </td>
                <td className="px-3 py-2 capitalize">
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-700">
                    {u.role}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className="text-xs text-gray-700 font-medium">
                    {u.requestsLast30Days} request
                    {u.requestsLast30Days === 1 ? '' : 's'} in last 30 days
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">
                      {u.ipAddress || 'IP unknown'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : ''}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    disabled={updatingId === u.id}
                    onClick={() => toggleBlock(u)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      u.isBlocked
                        ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                        : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                    } disabled:opacity-50`}
                  >
                    {u.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState('');
  const [reviewingId, setReviewingId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    async function load() {
      try {
        setLoadingStats(true);
        setLoadingRequests(true);
        const [s, r] = await Promise.all([
          adminApi.getStats(),
          adminApi.listActiveRequests(),
        ]);
        setStats(s);
        setRequests(r);
      } catch (err) {
        setError(err.message || 'Failed to load admin data');
      } finally {
        setLoadingStats(false);
        setLoadingRequests(false);
      }
    }
    load();
  }, []);

  const refreshRequests = async () => {
    try {
      setLoadingRequests(true);
      const list = await adminApi.listActiveRequests();
      setRequests(list);
    } catch (err) {
      setError(err.message || 'Failed to refresh requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleReview = async (id, action) => {
    try {
      setReviewingId(id);
      await adminApi.reviewRequest(id, action);
      await refreshRequests();
    } catch (err) {
      setError(err.message || 'Failed to review request');
    } finally {
      setReviewingId(null);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden md:flex md:w-60 xl:w-72 flex-col bg-white border-r border-gray-200 shadow-sm">
        <div className="h-16 flex items-center px-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white text-xs font-bold">BL</span>
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-gray-900">
                Blood<span className="text-primary">Life</span>
              </p>
              <p className="text-[11px] text-gray-500 font-medium">Admin Dashboard</p>
            </div>
          </Link>
        </div>
        <div className="flex-1 p-3 text-sm text-gray-500">
          <p className="px-2 py-1 rounded-lg bg-gray-50 border border-gray-100">
            Monitor requests, verify documents, and manage users.
          </p>
        </div>
        <div className="p-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 md:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white text-xs font-bold">BL</span>
              </div>
              <p className="text-sm font-bold text-gray-900">
                Blood<span className="text-primary">Life</span>
              </p>
            </Link>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm font-semibold">
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 truncate max-w-[160px]">
                {user?.name || 'Admin'}
              </span>
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
          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <section className="max-w-6xl space-y-8">
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-sm text-gray-500">
                High level metrics for requests, SOS alerts, and platform usage.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {loadingStats || !stats ? (
                <p className="text-sm text-gray-500 col-span-4">Loading stats...</p>
              ) : (
                <>
                  <StatCard label="Total lives saved" value={stats.totalLivesSaved ?? stats.successfulDonations} />
                  <StatCard label="Pending SOS alerts" value={stats.pendingSosAlerts ?? 0} />
                  <StatCard label="Registered donors" value={stats.donors} />
                  <StatCard label="Registered receivers" value={stats.receivers} />
                </>
              )}
            </div>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Request Manager</h2>
                  <p className="text-sm text-gray-500">
                    Review pending blood requests, validate documents, and approve or reject them.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={refreshRequests}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span>Refresh</span>
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5">
                  {loadingRequests ? (
                    <p className="text-sm text-gray-500">Loading requests...</p>
                  ) : requests.length === 0 ? (
                    <p className="text-sm text-gray-500">No active requests.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium">Receiver</th>
                            <th className="px-3 py-2 text-left font-medium">Blood / City</th>
                            <th className="px-3 py-2 text-left font-medium">Status</th>
                            <th className="px-3 py-2 text-left font-medium">Document</th>
                            <th className="px-3 py-2 text-right font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {requests.map((r) => (
                            <tr key={r.id}>
                              <td className="px-3 py-2">
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900">
                                    {r.receiver?.name || 'Unknown'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {r.receiver?.email}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900">
                                    {r.bloodGroup}
                                  </span>
                                  <span className="text-xs text-gray-500">{r.city}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs font-medium text-gray-700 capitalize">
                                    {r.status}
                                  </span>
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                      r.verificationStatus === 'verified'
                                        ? 'bg-green-100 text-green-700'
                                        : r.verificationStatus === 'rejected'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-amber-50 text-amber-700'
                                    }`}
                                  >
                                    {r.verificationStatus || 'pending'}
                                  </span>
                                  {r.isEmergency && (
                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-red-50 text-red-700">
                                      Emergency
                                    </span>
                                  )}
                                  {r.needsAdminApproval && !r.isEmergency && (
                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700">
                                      Needs approval
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                {r.documentUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => window.open(r.documentUrl, '_blank', 'noopener')}
                                    className="text-xs font-medium text-primary hover:text-primary-dark underline"
                                  >
                                    View document
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-400">None</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    disabled={reviewingId === r.id}
                                    onClick={() => handleReview(r.id, 'verify')}
                                    className="px-2 py-1 rounded-lg bg-green-50 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    disabled={reviewingId === r.id}
                                    onClick={() => handleReview(r.id, 'reject')}
                                    className="px-2 py-1 rounded-lg bg-red-50 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    type="button"
                                    disabled={reviewingId === r.id}
                                    onClick={() => handleReview(r.id, 'flag')}
                                    className="px-2 py-1 rounded-lg bg-amber-50 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                                  >
                                    Flag
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">User audit</h2>
                  <p className="text-sm text-gray-500">
                    Inspect user activity, request frequency, and quickly block suspicious accounts.
                  </p>
                </div>
              </div>
              <AdminUserAudit />
            </section>
          </section>
        </div>
        <Footer />
      </main>
    </div>
  );
}

