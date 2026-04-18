import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("API base URL is not configured.");
  }

  return API_BASE_URL.replace(/\/$/, "");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ run_id: string }> }
) {
  const { run_id } = await params;
  const response = await fetch(`${getApiBaseUrl()}/swarm/runs/${encodeURIComponent(run_id)}/actions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: await request.text(),
    cache: "no-store",
  });

  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json",
    },
  });
}
