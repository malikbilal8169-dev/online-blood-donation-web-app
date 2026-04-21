import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import RegisterDonor from './pages/RegisterDonor';
import RegisterReceiver from './pages/RegisterReceiver';
import DonorDashboard from './pages/DonorDashboard';
import ReceiverDashboard from './pages/ReceiverDashboard';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    if (user.role === 'donor') {
      return <Navigate to="/dashboard/donor" replace />;
    }
    if (user.role === 'receiver') {
      return <Navigate to="/dashboard/receiver" replace />;
    }
    if (user.role === 'admin') {
      return <Navigate to="/dashboard/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register/donor" element={<RegisterDonor />} />
      <Route path="/register/receiver" element={<RegisterReceiver />} />
      <Route
        path="/dashboard/donor"
        element={
          <ProtectedRoute role="donor">
            <DonorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/receiver"
        element={
          <ProtectedRoute role="receiver">
            <ReceiverDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
