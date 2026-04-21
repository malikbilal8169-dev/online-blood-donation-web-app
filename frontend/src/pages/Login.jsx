import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user?.role === 'donor') {
        navigate('/dashboard/donor', { replace: true });
      } else if (user?.role === 'receiver') {
        navigate('/dashboard/receiver', { replace: true });
      } else if (user?.role === 'admin') {
        navigate('/dashboard/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center mb-6 text-gray-700 hover:text-primary transition-colors duration-200">
          <span className="text-lg font-semibold text-gray-900">Blood<span className="text-primary">Life</span></span>
        </Link>
        <div className="text-center opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-6">
            <svg
              className="h-8 w-8 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C7 7 4 12 4 16c0 4.4 3.6 8 8 8s8-3.6 8-8c0-4-3-9-8-14z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-base text-gray-500">Please enter your details to login</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards', animationDelay: '150ms' }}>
        <div className="bg-white py-8 px-6 shadow rounded-lg border border-gray-100 transition-shadow duration-300 hover:shadow-md">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 rounded-md bg-primary text-white font-medium hover:bg-primary-dark focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link to="/register/donor" className="font-medium text-primary hover:text-primary-dark">
              Donor
            </Link>
            {' / '}
            <Link to="/register/receiver" className="font-medium text-primary hover:text-primary-dark">
              Receiver
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
