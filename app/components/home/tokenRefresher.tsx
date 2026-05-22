"use client";
import { useEffect } from "react";

const REFRESH_INTERVAL = 4 * 60 * 1000; // every 8 minutes

const TokenRefresher: React.FC = () => {
  useEffect(() => {
    // Refresh immediately on mount
    const refresh = async () => {
      try {
        await fetch("/api/auth/session/token");
      } catch {
        // fail silently
      }
    };

    refresh(); // run on mount

    const interval = setInterval(refresh, REFRESH_INTERVAL);

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  return null; // renders nothing
};

export default TokenRefresher;