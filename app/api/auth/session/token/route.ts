import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const token = (await cookies()).get("jb_token")?.value ?? null;
  return NextResponse.json({ token });
}