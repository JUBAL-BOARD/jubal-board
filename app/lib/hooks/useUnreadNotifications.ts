"use client";
import { useState, useEffect, useCallback } from "react";

export function useUnreadNotifications(pollMs = 30000) {
  const [count, setCount] = useState<number>(0);

  const fetchCount = useCallback(async () => {
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();
      if (!token) return;

      const res = await fetch("/api/v1/notifications", {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch notifications (${res.status})`);

      const json = await res.json();
      const list = Array.isArray(json.data) ? json.data : [];
      const unread = list.filter((n: any) => !n.isRead).length;
      setCount(unread);
    } catch (err) {
      console.error("Failed to fetch unread notifications:", err);
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, pollMs);
    return () => clearInterval(interval);
  }, [fetchCount, pollMs]);

  return { count, refetch: fetchCount };
}