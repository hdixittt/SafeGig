import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Register       from './pages/Register';
import Login          from './pages/Login';
import AdminLogin     from './pages/AdminLogin';
import Dashboard      from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Plans          from './pages/Plans';
import BonusDashboard from './pages/BonusDashboard';
import FAQ            from './pages/FAQ';
import CustomerCare   from './pages/CustomerCare';
import Chatbot        from './components/Chatbot';

const WorkerRoute = ({ children }) =>
  localStorage.getItem('sb_token') ? children : <Navigate to="/login" />;

const AdminRoute = ({ children }) =>
  localStorage.getItem('admin_token') ? children : <Navigate to="/admin/login" />;

function AppContent() {
  const location = useLocation();
  // Show chatbot only on worker-authenticated pages
  const showChatbot = localStorage.getItem('sb_token') &&
    ['/dashboard', '/plans', '/bonus', '/faq', '/support'].some(p => location.pathname.startsWith(p));

  return (
    <>
      <Routes>
        <Route path="/"             element={<Navigate to="/dashboard" />} />
        <Route path="/register"     element={<Register />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/admin/login"  element={<AdminLogin />} />
        <Route path="/dashboard"    element={<WorkerRoute><Dashboard /></WorkerRoute>} />
        <Route path="/plans"        element={<WorkerRoute><Plans /></WorkerRoute>} />
        <Route path="/bonus"        element={<WorkerRoute><BonusDashboard /></WorkerRoute>} />
        <Route path="/faq"          element={<WorkerRoute><FAQ /></WorkerRoute>} />
        <Route path="/support"      element={<WorkerRoute><CustomerCare /></WorkerRoute>} />
        <Route path="/admin"        element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
      {showChatbot && <Chatbot />}
    </>
  );
}

export default function App() {
  return <AppContent />;
}
