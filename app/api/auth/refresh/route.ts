import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("jb_refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://16.171.168.144";

  const res = await fetch('/api/v1/auth/refresh-token', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    cookieStore.delete("jb_token");
    cookieStore.delete("jb_refresh_token");
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
  }

  const data = await res.json();
  const newToken = data.data?.accessToken;
  const newRefreshToken = data.data?.refreshToken;

  cookieStore.set("jb_token", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
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
}