import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { useSidebar } from "../contexts/SidebarContext";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isExpanded } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Header - Above Sidebar */}
      <header className={`fixed top-0 bg-white border-b-2 border-gray-200 shadow-md z-50 flex items-center justify-between transition-all duration-300 ${
        isExpanded ? 'left-64 right-0' : 'left-16 lg:left-20 right-0'
      }`}>
        {/* Left Section - Logo & Brand */}
        <div className="flex items-center gap-4 lg:gap-5">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl p-3 lg:p-3.5 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 lg:w-9 lg:h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>

          <div className="flex flex-col">
            <h2 className="text-xl lg:text-2xl font-bold text-[#0A1931] leading-tight tracking-tight">Event Management System</h2>
            <p className="text-sm lg:text-base text-gray-600 mt-0.5 lg:mt-1 leading-relaxed">Panel administrasi dan manajemen event</p>
          </div>
        </div>

        {/* Right Section - User Profile */}
        <div className="flex items-center gap-4 lg:gap-5">
          <div className="text-right px-4 py-2 lg:px-5 lg:py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
            <p className="text-base lg:text-lg font-semibold text-[#0A1931] leading-tight">Admin User</p>
            <p className="text-sm lg:text-base text-gray-500 mt-0.5 leading-relaxed">admin@eventapp.com</p>
          </div>
          <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
            A
          </div>
        </div>
      </header>

      {/* Sidebar - Below Navbar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Container - Below Navbar and Beside Sidebar */}
      <div className={`flex flex-col transition-all duration-300 ${
        isExpanded ? 'ml-64' : 'ml-16 lg:ml-20'
      }`}>
        {/* Spacer untuk navbar height */}
        <div className="h-20 lg:h-24"></div>

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
