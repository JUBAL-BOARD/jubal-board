import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("jb_refresh_token")?.value;

  if (!refreshToken) {
    console.warn("=== REFRESH === No refresh token in cookies.");
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.jubalboard.com";

  try {
    const res = await fetch(`${baseUrl}/api/v1/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      console.warn("=== REFRESH === Refresh endpoint returned non-OK:", res.status);
      cookieStore.delete("jb_token");
      cookieStore.delete("jb_refresh_token");
      return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    }

    const data = await res.json();
    const newToken = data.data?.accessToken;
    const newRefreshToken = data.data?.refreshToken;

    // Guard: never write undefined to a cookie
    if (!newToken) {
      console.error("=== REFRESH === Response missing accessToken:", JSON.stringify(data));
      cookieStore.delete("jb_token");
      cookieStore.delete("jb_refresh_token");
      return NextResponse.json({ error: "No access token in response" }, { status: 401 });
    }

    // Compute maxAge from actual token expiry rather than hardcoding 7 days
    const payload = JSON.parse(atob(newToken.split(".")[1]));
    const expiresInSeconds = Math.floor((payload.exp * 1000 - Date.now()) / 1000);

    cookieStore.set("jb_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Math.max(expiresInSeconds, 60 * 30), // at least 30 min
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("=== REFRESH === Unexpected error:", err);
    return NextResponse.json({ error: "Internal error during refresh" }, { status: 500 });
  }
}