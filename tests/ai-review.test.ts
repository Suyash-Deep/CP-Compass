import assert from "node:assert/strict";
import test from "node:test";
import { reviewSubmission } from "../lib/ai-review.ts";
import type { ReviewRequest } from "../lib/types.ts";

const input: ReviewRequest = {
  problemTitle: "Range Sum",
  problemStatement: "Sum a list of integers.",
  language: "GNU C++17",
  verdict: "Wrong answer",
  code: "long long solve() {\n  int total = 0;\n  return total;\n}",
};

test("uses the offline reviewer when GROQ_API_KEY is absent", async () => {
  const originalKey = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;

  try {
    const review = await reviewSubmission(input);
    assert.equal(review.source, "offline");
    assert.equal(review.category, "INTEGER_OVERFLOW");
  } finally {
    if (originalKey) process.env.GROQ_API_KEY = originalKey;
  }
});

test("sends a strict structured-output request to Groq", async () => {
  const originalKey = process.env.GROQ_API_KEY;
  const originalFetch = globalThis.fetch;
  process.env.GROQ_API_KEY = "test-key";

  const structuredReview = {
    category: "OFF_BY_ONE",
    confidence: 0.9,
    summary: "Summary",
    rootCause: "Root cause",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    evidence: [{ line: 2, detail: "Evidence" }],
    hints: {
      observation: "One",
      direction: "Two",
      algorithmicIdea: "Three",
      guidance: "Four",
    },
    nextConcept: "Loop boundaries",
  };

  globalThis.fetch = async (url, init) => {
    assert.equal(url, "https://api.groq.com/openai/v1/chat/completions");
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer test-key");
    const body = JSON.parse(String(init?.body)) as {
      model: string;
      response_format: { type: string; json_schema: { strict: boolean } };
    };
    assert.equal(body.model, "openai/gpt-oss-20b");
    assert.equal(body.response_format.type, "json_schema");
    assert.equal(body.response_format.json_schema.strict, true);

    return Response.json({ choices: [{ message: { content: JSON.stringify(structuredReview) } }] });
  };

  try {
    const review = await reviewSubmission(input);
    assert.equal(review.source, "groq");
    assert.deepEqual(review.hints, ["One", "Two", "Three", "Four"]);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey) process.env.GROQ_API_KEY = originalKey;
    else delete process.env.GROQ_API_KEY;
  }
});
