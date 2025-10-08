import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function AssistiveTouchNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [position, setPosition] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Initialize position - right center
  useEffect(() => {
    if (position.x === null) {
      setPosition({
        x: window.innerWidth - 96, // 96px from right (24px margin + 72px button)
        y: window.innerHeight / 2 - 36, // center minus half button height
      });
    }
  }, []);

  // Handle drag start
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Handle dragging
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    if (isDragging && e.touches[0]) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add mouse move and up listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragStart]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsOpen(false);
    navigate("/login");
  };

  const menuItems = [
    {
      id: 1,
      label: "Dashboard",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      action: () => {
        navigate("/");
        setIsOpen(false);
      },
      color: "hover:bg-[#4A7FA7]/20",
    },
    {
      id: 2,
      label: "Profile",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      action: () => {
        navigate("/profile");
        setIsOpen(false);
      },
      color: "hover:bg-[#1A3D63]/20",
    },
    {
      id: 3,
      label: "Events",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      action: () => {
        navigate("/events");
        setIsOpen(false);
      },
      color: "hover:bg-[#B3CFE5]/20",
    },
    {
      id: 4,
      label: "Tiket Saya",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      action: () => {
        navigate("/tickets");
        setIsOpen(false);
      },
      color: "hover:bg-[#4A7FA7]/20",
    },
    {
      id: 5,
      label: "Notifikasi",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      action: () => {
        navigate("/notifications");
        setIsOpen(false);
      },
      badge: notificationCount,
      color: "hover:bg-[#1A3D63]/20",
    },
    {
      id: 6,
      label: "Settings",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      action: () => {
        navigate("/settings");
        setIsOpen(false);
      },
      color: "hover:bg-[#4A7FA7]/20",
    },
    {
      id: 7,
      label: "Logout",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      action: handleLogout,
      color: "hover:bg-red-500/20 text-red-400",
    },
  ];

  return (
    <>
      {/* Floating Bubble Button - Draggable & Responsive */}
      <button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          setIsDragging(true);
          setDragStart({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y,
          });
        }}
        onClick={(e) => {
          if (!isDragging) {
            setIsOpen(!isOpen);
          }
        }}
        style={{
          left: position.x !== null ? `${position.x}px` : 'auto',
          top: position.y !== null ? `${position.y}px` : '50%',
          transform: position.y === null ? 'translateY(-50%)' : 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        className={`fixed w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#1A3D63]/90 via-[#4A7FA7]/90 to-[#0A1931]/90 backdrop-blur-xl rounded-full shadow-2xl border-2 border-white/40 flex items-center justify-center text-white z-50 transition-all duration-300 ${
          isOpen ? "scale-110" : "hover:scale-105"
        } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {/* Simple Menu Icon - 3 lines */}
        <div className={`flex flex-col gap-1.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <div className="w-5 h-0.5 bg-white rounded-full"></div>
          <div className="w-5 h-0.5 bg-white rounded-full"></div>
          <div className="w-5 h-0.5 bg-white rounded-full"></div>
        </div>

        {/* Notification Badge on Bubble */}
        {notificationCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#B3CFE5] rounded-full border-2 border-white flex items-center justify-center shadow-lg">
            <span className="text-[#0A1931] text-xs font-bold">{notificationCount}</span>
          </div>
        )}
      </button>

      {/* Popup Menu - Dynamic Position & Responsive */}
      {isOpen && (
        <div
          ref={menuRef}
          style={{
            left: position.x !== null ? `${Math.max(10, position.x - 336)}px` : 'auto',
            top: position.y !== null ? `${Math.max(10, position.y - 200)}px` : 'auto',
          }}
          className={`fixed w-72 sm:w-80 bg-gradient-to-br from-[#0A1931]/80 via-[#1A3D63]/80 to-[#0A1931]/80 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl z-40 p-4 sm:p-5 transition-all duration-300 ${
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          {/* Menu Header */}
          <div className="mb-4 pb-3 border-b border-[#4A7FA7]/30">
            <h3 className="text-white font-bold text-base sm:text-lg drop-shadow-lg">Menu</h3>
            <p className="text-[#B3CFE5]/80 text-xs mt-1 drop-shadow">Event Atraksi Dashboard</p>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95 ${
                  item.id === 7 ? 'hover:bg-red-500/20 hover:border-red-400/50' : ''
                }`}
              >
                {/* Icon */}
                <div className={`mb-2 ${item.id === 7 ? 'text-red-400' : 'text-white'}`}>
                  {item.icon}
                </div>
                
                {/* Label */}
                <span className={`text-xs font-semibold text-center drop-shadow ${item.id === 7 ? 'text-red-300' : 'text-white'}`}>
                  {item.label}
                </span>

                {/* Badge for Notification */}
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-[#B3CFE5] rounded-full border-2 border-white flex items-center justify-center shadow-md">
                    <span className="text-[#0A1931] text-xs font-bold">{item.badge}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

    </>
  );
}
