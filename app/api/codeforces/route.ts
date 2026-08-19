import { NextResponse } from "next/server";
import { buildAnalyticsSnapshot } from "@/lib/analytics";
import { getCodeforcesBundle } from "@/lib/codeforces";
import { getSnapshotRepository } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const handle = new URL(request.url).searchParams.get("handle")?.trim();
  if (!handle || !/^[a-zA-Z0-9_.-]{3,24}$/.test(handle)) {
    return NextResponse.json({ error: "Enter a valid Codeforces handle." }, { status: 400 });
  }

  try {
    const bundle = await getCodeforcesBundle(handle);
    const snapshot = buildAnalyticsSnapshot(bundle);
    await getSnapshotRepository().save(snapshot);
    return NextResponse.json(snapshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sync Codeforces right now.";
    const status = /not found|handle/i.test(message) ? 404 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
