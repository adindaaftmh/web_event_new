import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { EventProvider } from './contexts/EventContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { RecommendedEventsProvider } from './contexts/RecommendedEventsContext';
import { InterestingFactsProvider } from './contexts/InterestingFactsContext';
import SmoothNavigation from './components/SmoothNavigation';

import HomePage from './pages/HomePage.jsx';
import EventDetail from './pages/EventDetail.jsx';
import EventRegistration from './pages/EventRegistration.jsx';
import CategoryEvents from './pages/CategoryEvents.jsx';
import Register from './pages/RegisterPremium.jsx';
import Login from './pages/LoginPremium.jsx';
import ForgotPassword from './pages/ForgotPasswordPremium.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminEvents from './pages/AdminEvents.jsx';
import EventData from './pages/EventData.jsx';
import Profile from './pages/Profile.jsx';
import AboutUs from './pages/AboutUs.jsx';
import Contact from './pages/Contact.jsx';

// Admin Authentication
import AdminLogin from './pages/admin/AdminLogin.jsx';

// Admin Submenu Components
import AddEvent from './pages/admin/AddEvent.jsx';
import ListEvents from './pages/admin/ListEvents.jsx';
import EventRecap from './pages/admin/EventRecap.jsx';
import ListParticipants from './pages/admin/ListParticipants.jsx';
import AttendanceList from './pages/admin/AttendanceList.jsx';
import IssuedCertificates from './pages/admin/IssuedCertificates.jsx';
import ListAccounts from './pages/admin/ListAccounts.jsx';
import UpdateFlyer from './pages/admin/UpdateFlyer.jsx';
import UpdateRecommendedEvents from './pages/admin/UpdateRecommendedEventsNew.jsx';
import UpdateInterestingFacts from './pages/admin/UpdateInterestingFacts.jsx';
import MonthlyActivityReport from './pages/admin/MonthlyActivityReport.jsx';
import EventParticipantRecap from './pages/admin/EventParticipantRecap.jsx';
import Messages from './pages/admin/Messages.jsx';

export default function App() {
  return (
    <EventProvider>
      <RecommendedEventsProvider>
        <InterestingFactsProvider>
          <SidebarProvider>
            <Router>
              <SmoothNavigation />
              <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventData />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/event/:id/register" element={<EventRegistration />} />
            <Route path="/category/:category" element={<CategoryEvents />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />

            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/events" element={<AdminEvents />} />

            {/* Event Management Submenu */}
            <Route path="/admin/events/add" element={<AddEvent />} />
            <Route path="/admin/events/list" element={<ListEvents />} />
            <Route path="/admin/events/recap" element={<EventRecap />} />

            {/* Participant Management Submenu */}
            <Route path="/admin/participants/list" element={<ListParticipants />} />
            <Route path="/admin/participants/attendance" element={<AttendanceList />} />

            {/* Certificate Management */}
            <Route path="/admin/certificates/issued" element={<IssuedCertificates />} />

            {/* Account Management Submenu */}
            <Route path="/admin/accounts/list" element={<ListAccounts />} />

            {/* Messages */}
            <Route path="/admin/messages" element={<Messages />} />

            {/* Settings Submenu */}
            <Route path="/admin/settings/flyer" element={<UpdateFlyer />} />
            <Route path="/admin/settings/recommended" element={<UpdateRecommendedEvents />} />
            <Route path="/admin/settings/facts" element={<UpdateInterestingFacts />} />

            {/* Reports */}
            <Route path="/admin/reports/monthly" element={<MonthlyActivityReport />} />
            <Route path="/admin/reports/participants" element={<EventParticipantRecap />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Router>
        </SidebarProvider>
        </InterestingFactsProvider>
      </RecommendedEventsProvider>
    </EventProvider>
  );
}
