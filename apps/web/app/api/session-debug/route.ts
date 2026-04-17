import { NextResponse } from "next/server";
import { getSafeSessionDebug, isDiagnosticsRequestAllowed } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isDiagnosticsRequestAllowed(request)) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const data = await getSafeSessionDebug(request);
  return NextResponse.json(data);
}
