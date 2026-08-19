# CP Compass

An AI-powered competitive programming coach that analyzes Codeforces submissions, identifies weak topics, recommends problems, and creates a personalized seven-day practice plan.

## Features

- Codeforces profile and submission analytics
- Topic mastery, verdict insights, and difficulty-aware recommendations
- Seven-day practice plan with local progress tracking
- AI code review with four progressive hints and an offline fallback

## Tech Stack

Next.js, React, TypeScript, Codeforces API, and the Groq API.

## Run Locally

```bash
corepack pnpm install
cp .env.example .env.local
corepack pnpm dev
```

Create a free API key in the [Groq console](https://console.groq.com/keys), then add it to `.env.local`:

```bash
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=openai/gpt-oss-20b
```

Restart the development server after changing environment variables. The key stays on the server and is never exposed to the browser. Without a key, the app uses its deterministic offline reviewer. Groq's free plan has rate limits, so it is free for development rather than unlimited usage.

Open [http://localhost:3000](http://localhost:3000).

## Validation

```bash
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
```
