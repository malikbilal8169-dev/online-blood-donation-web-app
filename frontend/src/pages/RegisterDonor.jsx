import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['male', 'female', 'other'];
const CITIES_PK = [
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

export default function RegisterDonor() {
  const { registerDonor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    bloodGroup: '',
    age: '',
    gender: '',
    medicalStatus: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const bloodGroup = location.state?.bloodGroup;
    if (bloodGroup && BLOOD_GROUPS.includes(bloodGroup)) {
      setForm((f) => ({ ...f, bloodGroup }));
    }
  }, [location.state?.bloodGroup]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerDonor({
        ...form,
        age: form.age ? parseInt(form.age, 10) : undefined,
      });
      navigate('/dashboard/donor', { replace: true });
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
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Donor Registration</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          {['name', 'email', 'password', 'phone', 'address'].map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {key}
              </label>
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
            <label className="block text-sm font-medium text-gray-700">City</label>
            <select
              name="city"
              required
              value={form.city}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">Select city</option>
              {CITIES_PK.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Age (18-65)</label>
            <input
              name="age"
              type="number"
              min={18}
              max={65}
              required
              value={form.age}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              required
              value={form.gender}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">Select</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Medical Status</label>
            <input
              name="medicalStatus"
              type="text"
              value={form.medicalStatus}
              onChange={handleChange}
              placeholder="Any conditions we should know"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-md bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? 'Registering...' : 'Register as Donor'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="font-medium text-primary">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
