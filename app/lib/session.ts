export async function saveSession(token: string, refreshToken?: string) {
  if (!token) {
    throw new Error("Missing auth token when saving session.");
  }

  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, refreshToken }),
  });

  if (!res.ok) {
    let message = "Unable to establish session.";
    try {
      const data = await res.json();
      if (data?.message) message = data.message as string;
    } catch (_) {
      const text = await res.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
}

export function parseAuthToken(responseData: any): string | null {
  if (!responseData) return null;
  return (
    responseData.token ||
    responseData.accessToken ||
    responseData.authToken ||
    responseData.data?.token ||
    responseData.data?.accessToken ||
    responseData.result?.token ||
    null
  );
}

// Add this alongside parseAuthToken
export function parseRefreshToken(responseData: any): string | null {
  if (!responseData) return null;
  return (
    responseData.refreshToken ||
    responseData.data?.refreshToken ||
    responseData.result?.refreshToken ||
    null
  );
}

export async function clearSession() {
  await fetch("/api/auth/session", { method: "DELETE", credentials: "include" });
}