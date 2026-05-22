import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // ✅ FIX: refresh 60 seconds BEFORE expiry, not 30 seconds after
    return payload.exp * 1000 < Date.now() + 60_000;
  } catch {
    return true;
  }
}

function getTokenExpiry(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000;
  } catch {
    return 0;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("jb_token")?.value ?? null;

  // No token at all
  if (!token) return NextResponse.json({ token: null });

  // Token still valid — return it
  if (!isTokenExpired(token)) return NextResponse.json({ token });

  // Token expired — try to refresh
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://16.171.168.144";
    const refreshToken = cookieStore.get("jb_refresh_token")?.value;

    if (!refreshToken) return NextResponse.json({ token: null });

    const res = await fetch(`${baseUrl}/api/v1/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      cookieStore.delete("jb_token");
      cookieStore.delete("jb_refresh_token");
      return NextResponse.json({ token: null });
    }

    const data = await res.json();
    const newToken = data.data?.accessToken;
    const newRefreshToken = data.data?.refreshToken;

    if (!newToken) return NextResponse.json({ token: null });

    // ✅ FIX: use the token's actual expiry for the cookie maxAge
    const expiresInSeconds = Math.floor((getTokenExpiry(newToken) - Date.now()) / 1000);

    cookieStore.set("jb_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      // ✅ FIX: at least 30 minutes, or whatever the token expiry is
      maxAge: Math.max(expiresInSeconds, 60 * 30),
      path: "/",
    });

    if (newRefreshToken) {
      cookieStore.set("jb_refresh_token", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    return NextResponse.json({ token: newToken });
  } catch {
    return NextResponse.json({ token: null });
  }
}