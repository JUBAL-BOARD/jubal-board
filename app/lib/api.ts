export class ApiError extends Error {
  constructor(public status: number, public data: Record<string, unknown>) {
    super((data?.message as string) || "Something went wrong");
  }
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiRequest<T = unknown>(
  path: string,
  options?: RequestInit,
  timeoutMs = 10000,
  _retry = false // internal flag to prevent infinite loop
): Promise<{ status: number; data: T }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Always get the latest token from the cookie
    const tokenRes = await fetch("/api/auth/session/token");
    const { token } = await tokenRes.json();

    const res = await fetch(path, {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await res.json();

    // If 401 and we haven't retried yet — attempt refresh then retry once
    if (res.status === 401 && !_retry) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return apiRequest<T>(path, options, timeoutMs, true); // retry once
      } else {
        // Refresh failed — clear session and redirect to login
        await fetch("/api/auth/session", { method: "DELETE" });
        window.location.href = "/signin/creative";
        throw new ApiError(401, { message: "Session expired. Please log in again." });
      }
    }

    if (!res.ok) throw new ApiError(res.status, data);
    return { status: res.status, data };

  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new ApiError(408, { message: "Request timed out. Please try again." });
    }
    throw err;
  }
}