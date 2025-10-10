import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { EventProvider } from './contexts/EventContext';
import { SidebarProvider } from './contexts/SidebarContext';

import HomePage from './pages/HomePage.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Register from './pages/RegisterPremium.jsx';
import Login from './pages/LoginPremium.jsx';
import ForgotPassword from './pages/ForgotPasswordPremium.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminEvents from './pages/AdminEvents.jsx';
import EventData from './pages/EventData.jsx';
import Profile from './pages/Profile.jsx';

// Admin Submenu Components
import AddEvent from './pages/admin/AddEvent.jsx';
import ListEvents from './pages/admin/ListEvents.jsx';
import EventRecap from './pages/admin/EventRecap.jsx';
import ListParticipants from './pages/admin/ListParticipants.jsx';
import ListAccounts from './pages/admin/ListAccounts.jsx';

export default function App() {
  return (
    <EventProvider>
      <SidebarProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventData />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<Profile />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/events" element={<AdminEvents />} />

            {/* Event Management Submenu */}
            <Route path="/admin/events/add" element={<AddEvent />} />
            <Route path="/admin/events/list" element={<ListEvents />} />
            <Route path="/admin/events/recap" element={<EventRecap />} />

            {/* Participant Management Submenu */}
            <Route path="/admin/participants/list" element={<ListParticipants />} />

            {/* Account Management Submenu */}
            <Route path="/admin/accounts/list" element={<ListAccounts />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SidebarProvider>
    </EventProvider>
  );
}
