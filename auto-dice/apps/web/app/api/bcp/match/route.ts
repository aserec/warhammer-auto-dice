import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (!searchParams.get("eventId") || !searchParams.get("matchId")) {
    return NextResponse.json({ status: "error", message: "Missing ids" }, { status: 400 });
  }
  if (!process.env.BCP_API_TOKEN) {
    return NextResponse.json({ status: "ok", lists: [] });
  }
  return NextResponse.json({
    status: "ok",
    lists: [{ id: "stub", name: "Stub list" }],
  });
}
