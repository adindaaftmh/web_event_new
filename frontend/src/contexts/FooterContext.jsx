import React, { createContext, useContext, useEffect, useState } from "react";
import { publicApiClient } from "../config/api";

const FooterContext = createContext();

export function useFooter() {
  const context = useContext(FooterContext);
  if (!context) {
    throw new Error("useFooter must be used within FooterProvider");
  }
  return context;
}

export function FooterProvider({ children }) {
  const [footer, setFooter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFooter = async () => {
    setLoading(true);
    try {
      const response = await publicApiClient.get("/footer");
      setFooter(response.data?.data || null);
      setError(null);
    } catch (err) {
      console.error("Error fetching footer:", err);
      setError("Gagal memuat data footer");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooter();
  }, []);

  const value = {
    footer,
    loading,
    error,
    refreshFooter: fetchFooter,
    setFooter,
  };

  return <FooterContext.Provider value={value}>{children}</FooterContext.Provider>;
}
