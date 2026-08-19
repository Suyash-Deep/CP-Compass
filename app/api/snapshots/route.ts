import { NextResponse } from "next/server";
import { getSnapshotRepository } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const handle = new URL(request.url).searchParams.get("handle")?.trim();
  if (!handle) return NextResponse.json({ error: "A handle is required." }, { status: 400 });
  const snapshot = await getSnapshotRepository().findByHandle(handle);
  if (!snapshot) return NextResponse.json({ error: "No in-memory snapshot found." }, { status: 404 });
  return NextResponse.json(snapshot);
}
