import type { CodeforcesBundle, CodeforcesProblem, CodeforcesSubmission, CodeforcesUser } from "./types";

const API_BASE = "https://codeforces.com/api";
const CACHE_TTL_MS = 15 * 60 * 1000;
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
  const response = await fetch(`${API_BASE}/${method}?${query}`, {
    headers: { "User-Agent": "CP-Compass/0.1 (personal learning project)" },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`Codeforces returned HTTP ${response.status}.`);
  const payload = (await response.json()) as { status: string; comment?: string; result?: T };
  if (payload.status !== "OK" || payload.result === undefined) {
    throw new Error(payload.comment || "Codeforces could not complete the request.");
  }
  return payload.result;
}

export async function getCodeforcesBundle(handle: string): Promise<CodeforcesBundle> {
  const cacheKey = handle.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const [user] = await callCodeforces<CodeforcesUser[]>("user.info", { handles: handle });
  await wait(2100);
  const submissions = await callCodeforces<CodeforcesSubmission[]>("user.status", {
    handle,
    from: "1",
    count: "1000",
  });
  await wait(2100);
  const [problems] = await callCodeforces<[CodeforcesProblem[], unknown[]]>("problemset.problems", {});

  const bundle = { user, submissions, problems };
  cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, data: bundle });
  return bundle;
}
