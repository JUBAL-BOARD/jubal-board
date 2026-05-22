export class ApiError extends Error {
  constructor(public status: number, public data: Record<string, unknown>) {
    super((data?.message as string) || "Something went wrong");
  }
}

export async function apiRequest<T = unknown>(
  path: string,
  options?: RequestInit,
  timeoutMs = 10000 // 10 seconds max
): Promise<{ status: number; data: T }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(path, {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json();
    if (!res.ok) {
      throw new ApiError(res.status, data);
    }

    return { status: res.status, data };
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err.name === "AbortError") {
      throw new ApiError(408, { message: "Request timed out. Please try again." });
    }

    throw err;
  }
}