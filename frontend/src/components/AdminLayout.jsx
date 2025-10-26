import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { useSidebar } from "../contexts/SidebarContext";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isExpanded } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Container - Beside Sidebar */}
      <div className={`flex flex-col transition-all duration-300 ${
        isExpanded ? 'ml-64' : 'ml-16 lg:ml-20'
      }`}>
        {/* Main Content Area */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
