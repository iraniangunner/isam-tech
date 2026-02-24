import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import api from "../api/axios";

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Skip in development
    if (import.meta.env.DEV) return;

    api.post("/track", { page: location.pathname }).catch(() => {});
  }, [location.pathname]);
}
