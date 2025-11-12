import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "../contexts/SidebarContext";
import { ChevronDown } from 'lucide-react';

// Icon components sebagai SVG
const Icons = {
  FaList: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  FaUsers: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  FaFileExport: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  FaSearch: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  FaUser: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  FaLock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  FaCog: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  FaChartBar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  FaCertificate: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  FaEnvelope: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
};

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isExpanded, setIsExpanded, isMobile } = useSidebar();

  const [openMenus, setOpenMenus] = useState({
    events: false,
    participants: false,
    accounts: false,
    certificates: false,
    reports: false,
    settings: false
  });

  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: (
        <svg className={`${isExpanded ? 'w-5 h-5' : 'w-6 h-6'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
        </svg>
      ),
      path: "/admin/dashboard",
      hasSubmenu: false
    },
    {
      id: "events",
      name: "Data Kegiatan",
      icon: <Icons.FaList />,
      path: "/admin/events",
      hasSubmenu: true,
      submenu: [
        { 
          id: "add-event", 
          name: "Tambah Kegiatan Baru", 
          path: "/admin/events/add",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )
        },
        { 
          id: "event-recap", 
          name: "Rekap Kegiatan", 
          path: "/admin/events/recap",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )
        }
      ]
    },
    {
      id: "participants",
      name: "Data Peserta",
      icon: <Icons.FaUsers />,
      path: "/admin/participants/list",
      hasSubmenu: false
    },
    {
      id: "accounts",
      name: "Daftar Akun Pengguna",
      icon: <Icons.FaUser />,
      path: "/admin/accounts/list",
      hasSubmenu: false
    },
    {
      id: "messages",
      name: "Pesan Kontak",
      icon: <Icons.FaEnvelope />,
      path: "/admin/messages",
      hasSubmenu: false
    },
    {
      id: "revenue",
      name: "Pendapatan",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      path: "/admin/revenue/recap",
      hasSubmenu: false
    },
    {
      id: "certificates",
      name: "Sertifikat & Daftar Hadir",
      icon: <Icons.FaCertificate />,
      path: "/admin/certificates",
      hasSubmenu: true,
      submenu: [
        { 
          id: "attendance-list", 
          name: "Daftar Hadir Peserta", 
          path: "/admin/participants/attendance",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 4h.01M9 16h.01" />
            </svg>
          )
        },
        { 
          id: "issued-certificates", 
          name: "Daftar Sertifikat Dikeluarkan", 
          path: "/admin/certificates/issued",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
      ]
    },
    {
      id: "settings",
      name: "Pengaturan Tampilan",
      icon: <Icons.FaCog />,
      path: "/admin/settings",
      hasSubmenu: true,
      submenu: [
        { 
          id: "update-flyer", 
          name: "Update Flyer Hero", 
          path: "/admin/settings/flyer",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )
        },
        { 
          id: "update-recommended", 
          name: "Update Rekomendasi Event", 
          path: "/admin/settings/recommended",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          )
        },
        { 
          id: "update-facts", 
          name: "Update Fakta Menarik", 
          path: "/admin/settings/facts",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          )
        }
      ]
    }
  ];

  // Auto open menu yang aktif
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.hasSubmenu && location.pathname.startsWith(item.path)) {
        setOpenMenus(prev => ({ ...prev, [item.id]: true }));
      }
    });
  }, [location.pathname]);

  const toggleSubmenu = (menuId) => {
    setOpenMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const handleMenuClick = (item) => {
    if (item.hasSubmenu) {
      toggleSubmenu(item.id);
    } else {
      navigate(item.path);
    }
  };

  const handleSubmenuClick = (path) => navigate(path);

  const handleBackdropClick = () => {
    if (isMobile) {
      setIsExpanded(false);
    }
  };

  return (
    <>
      {/* Backdrop untuk mobile */}
      {isMobile && isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300"
          onClick={handleBackdropClick}
        />
      )}

      {/* Sidebar - Below Navbar */}
      <aside className={`fixed left-0 top-0 h-screen bg-white shadow-xl border-r border-gray-200/80 flex flex-col transition-all duration-300 ease-in-out z-[60] ${
        isExpanded ? 'w-64' : 'w-16 lg:w-20'
      }`}>
        {/* Logo Section - Clickable as Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center border-b border-gray-200 transition-all duration-200 w-full hover:bg-gray-50 active:bg-gray-100 cursor-pointer ${
            isExpanded ? 'gap-3 px-4 py-4 justify-start' : 'px-3 py-4 justify-center'
          }`}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          {isExpanded && (
            <span className="text-[#0A1931] font-bold text-base">Admin Panel</span>
          )}
        </button>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <div key={item.id} className="mb-2">
              {/* Main Menu Item */}
              <button
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center transition-all duration-200 ease-in-out rounded-lg transform-gpu will-change-transform cursor-pointer hover:scale-105 active:scale-95 active:translate-y-0.5 ${
                  isExpanded
                    ? 'gap-3 px-4 py-3'
                    : 'px-2 py-3 justify-center'
                } ${
                  location.pathname.startsWith(item.path)
                    ? isExpanded
                      ? "bg-[#4A7FA7] text-white shadow-lg active:bg-blue-700"
                      : "border-l-4 border-[#4A7FA7] bg-[#4A7FA7]/10 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 hover:shadow-md active:bg-gray-200"
                }`}
                title={!isExpanded ? item.name : ''}
              >
                <div className={`transition-all duration-200 ease-in-out hover:scale-110 ${
                  location.pathname.startsWith(item.path) ? (isExpanded ? "text-white" : "text-[#4A7FA7]") : "text-gray-600"
                }`}>
                  {item.icon}
                </div>
                {isExpanded && (
                  <span className="font-medium flex-1 text-left text-sm">{item.name}</span>
                )}
                {isExpanded && item.hasSubmenu && (
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ease-in-out transform-gpu ${
                    openMenus[item.id] ? 'rotate-180' : 'rotate-0'
                  }`} />
                )}
              </button>

              {/* Submenu */}
              <div className={`overflow-hidden transition-all duration-300 ease-out transform-gpu origin-top ${
                item.hasSubmenu && openMenus[item.id] && isExpanded 
                  ? 'max-h-96 opacity-100 translate-y-0' 
                  : 'max-h-0 opacity-0 -translate-y-2'
              }`}>
                <div className="ml-12 mt-2 space-y-1">
                  {item.hasSubmenu && item.submenu.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubmenuClick(sub.path)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ease-in-out transform-gpu will-change-transform cursor-pointer hover:scale-105 active:scale-95 active:translate-y-0.5 hover:shadow-sm text-xs ${
                        location.pathname === sub.path
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm border-l-4 border-blue-500"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900 active:bg-gray-200"
                      }`}
                      title={!isExpanded ? sub.name : ''}
                    >
                      {sub.icon && (
                        <div className={`transition-all duration-200 ${
                          location.pathname === sub.path ? "text-blue-600" : "text-gray-500"
                        }`}>
                          {sub.icon}
                        </div>
                      )}
                      <span className="font-medium">{sub.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>

        {/* Profile & Logout Section */}
        <div className={`p-4 border-t border-gray-200 space-y-2 ${isExpanded ? '' : 'absolute bottom-4 left-0 right-0'}`}>
          {/* Profile Button */}
          <button
            onClick={() => navigate("/admin/profile")}
            className={`w-full flex items-center transition-all duration-200 ease-in-out rounded-lg border transform-gpu will-change-transform cursor-pointer hover:scale-105 active:scale-95 active:translate-y-0.5 hover:shadow-md ${
              location.pathname === '/admin/profile'
                ? 'bg-[#4A7FA7] text-white border-[#4A7FA7] shadow-lg'
                : 'text-[#4A7FA7] hover:bg-blue-50 hover:text-[#1A3D63] border-blue-200 hover:border-blue-300 active:bg-blue-100'
            } ${
              isExpanded ? 'gap-3 px-4 py-3' : 'px-2 py-3 justify-center'
            }`}
            title={!isExpanded ? 'Profile' : ''}
          >
            <Icons.FaUser />
            {isExpanded && <span className="font-semibold text-sm">Profile</span>}
          </button>
          
          {/* Logout Button */}
          <button
            onClick={() => {
              if (window.confirm("Apakah yakin ingin keluar?")) {
                localStorage.removeItem("adminToken");
                navigate("/admin/login");
              }
            }}
            className={`w-full flex items-center transition-all duration-200 ease-in-out rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 hover:border-red-300 transform-gpu will-change-transform cursor-pointer hover:scale-105 active:scale-95 active:translate-y-0.5 hover:shadow-md active:bg-red-100 ${
              isExpanded ? 'gap-3 px-4 py-3' : 'px-2 py-3 justify-center'
            }`}
            title={!isExpanded ? 'Keluar' : ''}
          >
            <Icons.FaLock />
            {isExpanded && <span className="font-semibold text-sm">Keluar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
