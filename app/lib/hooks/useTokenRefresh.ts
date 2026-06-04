import { useEffect, useRef } from "react";
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
      try {
        const res = await fetch("/api/auth/session/token", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to refresh session token");
        }

        const data = await res.json();
        const token = data.token;

        if (!token) {
          await clearSession();
          router.replace("/signin/creative");
          return;
        }

        const expiry = getTokenExpiry(token);
        if (!expiry) {
          await clearSession();
          router.replace("/signin/creative");
          return;
        }

        let delay = expiry - Date.now() - REFRESH_BUFFER_MS;
        if (delay <= 0) {
          delay = 1000;
          console.warn("[useTokenRefresh] Token already expiring; retrying refresh in 1s");
        }
        console.log(`[useTokenRefresh] Token expires in ${Math.round(delay / 1000)}s`);
        timerRef.current = setTimeout(schedule, delay);
      } catch (err) {
        await clearSession();
        router.replace("/signin/creative");
      }
    }

    schedule();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [router]);
}