import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { clearSession } from "@/app/lib/session";

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes
const LAST_ACTIVITY_KEY = "jb_last_activity";

export function useInactivityLogout() {
  const router = useRouter();

  const logout = useCallback(async () => {
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    await clearSession();
    router.replace("/signin/creative");
  }, [router]);

  useEffect(() => {
    const updateActivity = () =>
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());

    const checkInactivity = () => {
      const last = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (!last) return;
      if (Date.now() - parseInt(last) > INACTIVITY_LIMIT) logout();
    };

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, updateActivity));
    updateActivity(); // set on mount

    const interval = setInterval(checkInactivity, 60 * 1000); // check every minute

    return () => {
      events.forEach((e) => window.removeEventListener(e, updateActivity));
      clearInterval(interval);
    };
  }, [logout]);
}