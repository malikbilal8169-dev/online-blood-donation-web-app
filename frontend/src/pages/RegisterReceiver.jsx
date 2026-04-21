import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function RegisterReceiver() {
  const { registerReceiver } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bloodGroup: '',
    address: 'N/A',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerReceiver(form);
      navigate('/dashboard/receiver', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Link to="/" className="flex items-center gap-2 text-gray-700 hover:text-primary">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">BL</span>
          </div>
          <span className="font-bold text-gray-900">Blood<span className="text-primary">Life</span></span>
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Receiver Registration</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          {['name', 'email', 'password', 'phone'].map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 capitalize">{key}</label>
              <input
                name={key}
                type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'}
                required
                value={form[key]}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700">Blood Group</label>
            <select
              name="bloodGroup"
              required
              value={form.bloodGroup}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">Select</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-md bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? 'Registering...' : 'Register as Receiver'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="font-medium text-primary">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
