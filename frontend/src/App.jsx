import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Register from './pages/RegisterPremium.jsx';
import Login from './pages/LoginPremium.jsx';
import ForgotPassword from './pages/ForgotPasswordPremium.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminEvents from './pages/AdminEvents.jsx';
import EventData from './pages/EventData.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventData />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
