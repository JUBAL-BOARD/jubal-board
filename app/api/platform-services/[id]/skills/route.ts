import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://16.171.168.144:3000";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();

  const res = await fetch(
    `${BASE_URL}/api/v1/platform-services/${params.id}/skills${query ? `?${query}` : ""}`,
    { credentials: "include" }
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}