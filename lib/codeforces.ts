import type { CodeforcesBundle, CodeforcesProblem, CodeforcesSubmission, CodeforcesUser } from "./types";

const API_BASE = "https://codeforces.com/api";
const CACHE_TTL_MS = 15 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 2;
const RATE_LIMIT_DELAY_MS = 2_100;
const globalCache = globalThis as typeof globalThis & {
  cpCompassCache?: Map<string, { expiresAt: number; data: CodeforcesBundle }>;
};

const cache = globalCache.cpCompassCache ?? new Map();
globalCache.cpCompassCache = cache;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callCodeforces<T>(method: string, params: Record<string, string>) {
  const query = new URLSearchParams(params);
  const url = `${API_BASE}/${method}?${query}`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "CP-Compass/0.1 (personal learning project)" },
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        const retryable = response.status === 429 || response.status >= 500;
        if (retryable && attempt < MAX_ATTEMPTS) {
          await wait(RATE_LIMIT_DELAY_MS);
          continue;
        }
        if (response.status === 429) {
          throw new Error("Codeforces is rate-limiting requests. Please wait a moment and try again.");
        }
        throw new Error(`Codeforces returned HTTP ${response.status}.`);
      }

      const payload = (await response.json()) as { status: string; comment?: string; result?: T };
      if (payload.status !== "OK" || payload.result === undefined) {
        throw new Error(payload.comment || "Codeforces could not complete the request.");
      }
      return payload.result;
    } catch (error) {
      const name = error instanceof Error ? error.name : "";
      const message = error instanceof Error ? error.message : "";
      const timedOut = name === "TimeoutError" || name === "AbortError" || /aborted due to timeout|timed? out/i.test(message);
      const networkFailure = error instanceof TypeError;

      if ((timedOut || networkFailure) && attempt < MAX_ATTEMPTS) {
        await wait(RATE_LIMIT_DELAY_MS);
        continue;
      }
      if (timedOut) {
        throw new Error("Codeforces took too long to respond. Please try again in a moment.");
      }
      if (networkFailure) {
        throw new Error("Could not reach Codeforces. Check your connection and try again.");
      }
      throw error;
    }
  }

  throw new Error("Codeforces could not complete the request.");
}

export async function getCodeforcesBundle(handle: string): Promise<CodeforcesBundle> {
  const cacheKey = handle.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const [user] = await callCodeforces<CodeforcesUser[]>("user.info", { handles: handle });
  await wait(RATE_LIMIT_DELAY_MS);
  const submissions = await callCodeforces<CodeforcesSubmission[]>("user.status", {
    handle,
    from: "1",
    count: "1000",
  });
  await wait(RATE_LIMIT_DELAY_MS);
  const problemset = await callCodeforces<{ problems: CodeforcesProblem[]; problemStatistics: unknown[] }>("problemset.problems", {});
  const problems = problemset.problems;

  const bundle = { user, submissions, problems };
  cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, data: bundle });
  return bundle;
}
