import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Reduced buffer to 30s — 3 min was causing premature logouts
    return payload.exp * 1000 < Date.now() + 30_000;
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

  if (!token) {
    return NextResponse.json({ token: null });
  }

  if (!isTokenExpired(token)) {
    return NextResponse.json({ token });
  }

  // Token is expired (or nearly) — attempt refresh
  try {
    const refreshToken = cookieStore.get("jb_refresh_token")?.value;

    if (!refreshToken) {
      console.warn("=== SESSION === No refresh token found, logging out.");
      return NextResponse.json({ token: null });
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.jubalboard.com";

    const res = await fetch(`${baseUrl}/api/v1/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      console.warn("=== SESSION === Refresh endpoint returned non-OK:", res.status);
      cookieStore.delete("jb_token");
      cookieStore.delete("jb_refresh_token");
      return NextResponse.json({ token: null });
    }

    const data = await res.json();
    const newToken = data.data?.accessToken;
    const newRefreshToken = data.data?.refreshToken;

    // Guard: if backend didn't return a token, don't silently write undefined
    if (!newToken) {
      console.error("=== SESSION === Refresh response missing accessToken:", JSON.stringify(data));
      cookieStore.delete("jb_token");
      cookieStore.delete("jb_refresh_token");
      return NextResponse.json({ token: null });
    }

    const expiresInSeconds = Math.floor((getTokenExpiry(newToken) - Date.now()) / 1000);

    // Diagnostic log — remove once confirmed stable
    const accessPayload = JSON.parse(atob(newToken.split(".")[1]));
    console.log("=== SESSION === New token exp:", new Date(accessPayload.exp * 1000).toISOString());
    console.log("=== SESSION === Cookie maxAge (s):", Math.max(expiresInSeconds, 60 * 30));

    cookieStore.set("jb_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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
  } catch (err) {
    console.error("=== SESSION === Unexpected error during refresh:", err);
    return NextResponse.json({ token: null });
  }
}
