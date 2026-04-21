import React, { useEffect, useState } from 'react';
import { donors } from '../../lib/api';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function formatRemainingDays(remainingDays) {
  if (!remainingDays || remainingDays <= 0) return 'You can donate now';
  if (remainingDays === 1) return 'Next donation available in 1 day';
  return `Next donation available in ${remainingDays} days`;
}

export default function AvailabilityToggle() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(null);
  const [remainingDays, setRemainingDays] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchProfile() {
      try {
        setError('');
        const data = await donors.getMe();
        if (cancelled) return;
        setIsEnabled(data.isProfileEnabled);
        setCooldownUntil(data.cooldownUntil ? new Date(data.cooldownUntil) : null);
        setRemainingDays(data.remainingDays || 0);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Something went wrong');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProfile();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!cooldownUntil) return undefined;
    const update = () => {
      const diff = cooldownUntil.getTime() - Date.now();
      setRemainingDays(diff <= 0 ? 0 : Math.ceil(diff / DAY_IN_MS));
    };
    update();
    const id = setInterval(update, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const handleToggle = async () => {
    try {
      setSaving(true);
      setError('');
      const data = await donors.toggleAvailability(!isEnabled);
      setIsEnabled(data.isProfileEnabled);
      setCooldownUntil(data.cooldownUntil ? new Date(data.cooldownUntil) : null);
      setRemainingDays(data.remainingDays || 0);
    } catch (err) {
      setError(err.message || 'Something went wrong');
      if (err.remainingDays != null) setRemainingDays(err.remainingDays);
      if (err.cooldownUntil) setCooldownUntil(new Date(err.cooldownUntil));
    } finally {
      setSaving(false);
    }
  };

  const inCooldown = remainingDays > 0 && cooldownUntil && cooldownUntil > new Date();

  if (loading) {
    return (
      <div className="w-full p-5 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center gap-2">
        <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-gray-500">Loading availability...</p>
      </div>
    );
  }

  return (
    <div className="w-full p-5 rounded-2xl bg-white shadow-sm border border-gray-100 flex flex-col gap-4 transition-shadow duration-300 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Donor Availability</h2>
            <p className="text-sm text-gray-500 mt-0.5">Control whether receivers can find your profile.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={saving || inCooldown}
          className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/30 ${
            isEnabled && !inCooldown ? 'bg-primary' : 'bg-gray-200'
          } ${saving || inCooldown ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <span
            className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              isEnabled && !inCooldown ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${
              isEnabled && !inCooldown ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <span className={`mr-1.5 h-2 w-2 rounded-full ${isEnabled && !inCooldown ? 'bg-green-500' : 'bg-gray-400'}`} />
            {isEnabled && !inCooldown ? 'Profile Enabled' : 'Profile Disabled'}
          </span>
          {inCooldown && (
            <span className="text-xs font-medium text-primary">
              {formatRemainingDays(remainingDays)}
            </span>
          )}
        </div>
        {!inCooldown && (
          <span className="text-xs text-gray-500">
            {isEnabled ? 'You will appear in receiver search results.' : 'You are hidden from receiver search results.'}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
      )}
    </div>
  );
}
