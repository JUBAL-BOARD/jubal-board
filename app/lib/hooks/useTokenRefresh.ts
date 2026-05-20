import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { clearSession } from "@/app/lib/session";

const LAST_ACTIVITY_KEY = "jb_last_activity";
const INACTIVITY_LIMIT = 30 * 60 * 1000;

export function useTokenRefresh() {
  const router = useRouter();

  const refresh = useCallback(async () => {
    const last = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!last || Date.now() - parseInt(last) > INACTIVITY_LIMIT) return;

    const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });

    if (!res.ok) {
      await clearSession();
      router.replace("/signin/creative");
    }
  }, [router]);

  useEffect(() => {
    const interval = setInterval(refresh, 8 * 60 * 1000); // refresh every 8 min
    return () => clearInterval(interval);
  }, [refresh]);
}