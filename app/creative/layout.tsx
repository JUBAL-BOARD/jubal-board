"use client";

import { useInactivityLogout } from "@/app/lib/hooks/useInactivityLogout";
import { useTokenRefresh } from "@/app/lib/hooks/useTokenRefresh";

export default function CreativeLayout({ children }: { children: React.ReactNode }) {
  useInactivityLogout();
  useTokenRefresh();
  return <>{children}</>;
}