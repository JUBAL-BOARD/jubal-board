import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { clearSession } from "@/app/lib/session";

const LAST_ACTIVITY_KEY = "jb_last_activity";
const INACTIVITY_LIMIT = 30 * 60 * 1000;
const REFRESH_BUFFER_MS = 60 * 1000;

function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function useTokenRefresh() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function schedule() {
      const res = await fetch("/api/auth/session", { method: "GET", credentials: "include" });
      const data = await res.json();

      if (!data.token) {
        await clearSession();
        router.replace("/signin/creative");
        return;
      }

      const expiry = getTokenExpiry(data.token);
      if (!expiry) return;

      const delay = expiry - Date.now() - REFRESH_BUFFER_MS;
      console.log(`[useTokenRefresh] Token expires in ${Math.round(delay / 1000)}s`);

      if (delay <= 0) {
        await clearSession();
        router.replace("/signin/creative");
        return;
      }

      timerRef.current = setTimeout(async () => {
        const last = localStorage.getItem(LAST_ACTIVITY_KEY);
        if (last && Date.now() - parseInt(last) < INACTIVITY_LIMIT) {
          // User is active but token is expiring — nothing we can do without refresh token
          // Just clear and redirect
        }
        await clearSession();
        router.replace("/signin/creative");
      }, delay);
    }

    schedule();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [router]);
}