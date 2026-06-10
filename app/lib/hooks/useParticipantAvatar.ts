import { useState, useEffect } from "react";

async function getToken(): Promise<string> {
  const res = await fetch("/api/auth/session/token", { credentials: "include" });
  const { token } = await res.json();
  return token || "";
}

export function useParticipantAvatar(participantId: string, participantName: string) {
  const [avatarUrl, setAvatarUrl] = useState<string>(
    `https://ui-avatars.com/api/?name=${encodeURIComponent(participantName)}&background=1a1a2e&color=fff&size=64`
  );

  useEffect(() => {
    if (!participantId) return;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`/api/v1/creatives/${participantId}/public-profile`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) return; // client or not found — keep fallback
        const data = await res.json();
        const url = data?.imageUrl || data?.data?.imageUrl;
        if (url) setAvatarUrl(url);
      } catch {
        // silently keep fallback
      }
    })();
  }, [participantId]);

  return avatarUrl;
}