import { NextResponse } from "next/server";
import { reviewSubmission } from "@/lib/ai-review";
import type { ReviewRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as Partial<ReviewRequest>;
    if (!input.code?.trim() || input.code.length > 16000) {
      return NextResponse.json({ error: "Add source code between 1 and 16,000 characters." }, { status: 400 });
    }
    const review = await reviewSubmission({
      problemTitle: input.problemTitle?.trim() || "Untitled problem",
      problemStatement: input.problemStatement?.trim() || "No statement supplied.",
      language: input.language?.trim() || "C++",
      verdict: input.verdict?.trim() || "Wrong answer",
      code: input.code,
    });
    return NextResponse.json(review);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The review could not be generated.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
