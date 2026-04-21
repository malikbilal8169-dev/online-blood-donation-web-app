import React, { useState, useEffect } from 'react';
import { donors } from '../../lib/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['male', 'female', 'other'];

export default function DonorProfileForm({ onDeleted }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    bloodGroup: '',
    age: '',
    gender: '',
    medicalStatus: '',
  });

  useEffect(() => {
    let cancelled = false;
    donors
      .getMe()
      .then((data) => {
        if (cancelled) return;
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          bloodGroup: data.bloodGroup || '',
          age: data.age ?? '',
          gender: data.gender || '',
          medicalStatus: data.medicalStatus || '',
        });
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await donors.updateProfile({
        ...form,
        age: form.age ? parseInt(form.age, 10) : undefined,
      });
      setError('');
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your donor profile permanently? This cannot be undone.')) return;
    setDeleting(true);
    setError('');
    try {
      await donors.deleteProfile();
      onDeleted?.();
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading profile...</p>;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-base font-semibold text-gray-900">Edit Profile</h2>
        <p className="text-xs text-gray-500 mt-0.5">Update your donor information.</p>
      </div>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
        {['name', 'phone', 'address', 'city'].map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 capitalize mb-1">{key}</label>
            <input
              name={key}
              type={key === 'phone' ? 'tel' : 'text'}
              value={form[key]}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
          <select
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Select</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age (18-65)</label>
            <input
              name="age"
              type="number"
              min={18}
              max={65}
              value={form.age}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Select</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Medical Status</label>
          <input
            name="medicalStatus"
            type="text"
            value={form.medicalStatus}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark disabled:opacity-60 shadow-sm transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 disabled:opacity-60 transition-colors"
          >
            {deleting ? 'Deleting...' : 'Delete profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
