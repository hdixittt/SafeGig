import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Register    from './pages/Register';
import Login       from './pages/Login';
import AdminLogin  from './pages/AdminLogin';
import Dashboard   from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

const WorkerRoute = ({ children }) =>
  localStorage.getItem('sb_token') ? children : <Navigate to="/login" />;

const AdminRoute = ({ children }) =>
  localStorage.getItem('admin_token') ? children : <Navigate to="/admin/login" />;

export default function App() {
  return (
    <Routes>
      <Route path="/"             element={<Navigate to="/dashboard" />} />
      <Route path="/register"     element={<Register />} />
      <Route path="/login"        element={<Login />} />
      <Route path="/admin/login"  element={<AdminLogin />} />
      <Route path="/dashboard"    element={<WorkerRoute><Dashboard /></WorkerRoute>} />
      <Route path="/admin"        element={<AdminRoute><AdminDashboard /></AdminRoute>} />
    </Routes>
  );
}
