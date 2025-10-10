import React, { createContext, useContext, useState, useEffect } from 'react';

// Sidebar Context
const SidebarContext = createContext();

// Sidebar Provider Component
export function SidebarProvider({ children }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size dan set default state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Default state: collapsed on mobile, expanded on desktop
      setIsExpanded(window.innerWidth >= 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const value = {
    isExpanded,
    setIsExpanded,
    isMobile,
    toggleSidebar: () => setIsExpanded(!isExpanded)
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

// Custom hook untuk menggunakan Sidebar Context
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
