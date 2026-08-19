# CP Compass

An AI-powered competitive programming coach that analyzes Codeforces submissions, identifies weak topics, recommends problems, and creates a personalized seven-day practice plan.

## Features

- Codeforces profile and submission analytics
- Topic mastery, verdict insights, and difficulty-aware recommendations
- Seven-day practice plan with local progress tracking
- AI code review with four progressive hints and an offline fallback

## Tech Stack

Next.js, React, TypeScript, Codeforces API, and OpenAI Responses API.

## Run Locally

```bash
corepack pnpm install
cp .env.example .env.local
corepack pnpm dev
```

Add your `OPENAI_API_KEY` to `.env.local` for AI reviews. Without it, the app uses the offline reviewer.

Open [http://localhost:3000](http://localhost:3000).

## Validation

```bash
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
```
