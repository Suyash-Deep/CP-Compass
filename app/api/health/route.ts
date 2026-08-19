import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    ai: process.env.GROQ_API_KEY ? "groq" : "offline",
    database: "not-connected",
    timestamp: new Date().toISOString(),
  });
}
