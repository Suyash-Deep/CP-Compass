# CP Compass

CP Compass is an adaptive competitive-programming coach. It turns a Codeforces submission history into topic-level mastery scores, a difficulty-aware seven-day practice plan, and evidence-linked submission reviews with four progressive hints.

The application is complete without a database: live snapshots are held behind an in-memory repository on the server and retained in the browser with `localStorage`. The repository interface is intentionally small so PostgreSQL can replace it later without changing the API or UI contracts.

## Included

- Responsive coaching dashboard with a polished desktop and mobile experience
- Live Codeforces handle connection using `user.info`, `user.status`, and `problemset.problems`
- Rate-limit-aware API calls, request timeout, 15-minute server cache, and friendly fallback errors
- Submission, solve-rate, attempt-count, active-day, verdict, and topic mastery analytics
- Difficulty-aware recommendations that exclude previously attempted problems
- Seven-day practice schedule with completion tracking stored locally
- Topic weakness table and verdict breakdown
- AI review endpoint with a strict structured-output schema
- Prompt-injection boundaries for untrusted problem statements and source code
- Four progressive hint levels that avoid revealing the complete solution
- Deterministic offline reviewer for integer overflow, boundary, and complexity issues
- OpenAI Responses API integration activated automatically when a key is configured
- Repository abstraction ready for a future PostgreSQL implementation
- Health and cached-snapshot endpoints

## Stack

- Next.js 15 and React 19
- TypeScript
- Lucide icons
- Codeforces API
- OpenAI Responses API with JSON Schema structured output
- Browser `localStorage` and an in-memory server repository until PostgreSQL is connected

## Run locally

Requirements: Node.js 20+ and pnpm 9+.

```bash
corepack pnpm install
corepack pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The app starts with a clearly labelled demo workspace, so every screen is usable without external credentials. Select **Sync Codeforces** to analyze a live handle.

## Enable OpenAI review

The offline review engine works without any environment variables. To enable model-backed reviews:

```bash
cp .env.example .env.local
```

Then set `OPENAI_API_KEY` inside `.env.local`. Do not expose this key in browser code or commit `.env.local`.

The model can be changed with `OPENAI_MODEL`; the default is `gpt-5.4-mini`. The backend uses the Responses API and asks for JSON Schema output so categories, confidence, evidence, complexity, and four hints have a stable shape.

## API routes

### `GET /api/health`

Reports whether the app is healthy, whether OpenAI or offline review is active, and whether a database is connected.

### `GET /api/codeforces?handle=<handle>`

Imports recent Codeforces data and returns a complete `AnalyticsSnapshot` containing the profile, summary metrics, topic mastery, verdict distribution, recommendations, and seven-day schedule.

### `POST /api/review`

Accepts:

```json
{
  "problemTitle": "Range Sum",
  "problemStatement": "Problem statement and constraints",
  "language": "GNU C++17",
  "verdict": "Wrong answer",
  "code": "source code"
}
```

Returns a structured diagnosis, evidence lines, complexity analysis, study topic, and exactly four progressive hints.

### `GET /api/snapshots?handle=<handle>`

Reads a snapshot that has already been synced during the current server process. This route will continue to work after the memory repository is replaced with PostgreSQL.

## Architecture

```text
Browser UI
  ├── dashboard, practice plan, review, insights
  ├── local completion state
  └── /api requests
          │
Next.js API layer
  ├── Codeforces client + cache
  ├── analytics and recommendation engine
  ├── OpenAI / offline review engine
  └── SnapshotRepository interface
          │
   Memory repository today
   PostgreSQL repository later
```

## Connecting PostgreSQL later

Implement the `SnapshotRepository` interface in `lib/repository.ts`:

```ts
export interface SnapshotRepository {
  findByHandle(handle: string): Promise<AnalyticsSnapshot | null>;
  save(snapshot: AnalyticsSnapshot): Promise<void>;
}
```

Recommended tables:

- `users`
- `platform_accounts`
- `problems`
- `submissions`
- `topic_mastery`
- `recommendations`
- `practice_schedule_items`
- `submission_reviews`
- `review_hints`

Change only `getSnapshotRepository()` to return the PostgreSQL implementation. The frontend and API response types do not need to change.

## Validation

```bash
corepack pnpm typecheck
corepack pnpm build
```

The health and offline-review endpoints can also be exercised while the development server is running.

## Data notes

- Codeforces limits API traffic, so CP Compass intentionally spaces calls and caches results.
- A public Codeforces history does not include source code. Users paste their own code into the review screen.
- The application never executes submitted source code.
- AI feedback can be wrong. Confidence and evidence are shown so users can verify the diagnosis rather than treating it as authoritative.
