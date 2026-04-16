import { NextResponse } from "next/server";
import { getSafeSessionDebug } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getSafeSessionDebug();
  return NextResponse.json(data);
}
