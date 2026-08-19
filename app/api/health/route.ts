import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    ai: process.env.OPENAI_API_KEY ? "openai" : "offline",
    database: "not-connected",
    timestamp: new Date().toISOString(),
  });
}
