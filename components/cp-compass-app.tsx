"use client";

import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Code2,
  Compass,
  ExternalLink,
  LayoutDashboard,
  LoaderCircle,
  RefreshCw,
  SearchCode,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { demoSnapshot } from "@/lib/demo-data";
import type { AnalyticsSnapshot, ReviewRequest, SubmissionReview } from "@/lib/types";

type View = "overview" | "practice" | "review" | "insights";

const navItems: Array<{ id: View; label: string; icon: typeof Compass }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "practice", label: "Practice plan", icon: CalendarDays },
  { id: "review", label: "AI code review", icon: SearchCode },
  { id: "insights", label: "Topic insights", icon: BarChart3 },
];

const initialReview: ReviewRequest = {
  problemTitle: "Range Sum",
  problemStatement: "Given up to 200,000 integers with absolute value up to 1e9, print their sum.",
  language: "GNU C++17",
  verdict: "Wrong answer",
  code: [
    "long long solve(vector<int>& a) {",
    "  int total = 0;",
    "  for (int x : a) total += x;",
    "  return total;",
    "}",
  ].join("\n"),
};

function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function rankColor(rank: string) {
  if (/master|grandmaster/i.test(rank)) return "rank-red";
  if (/candidate/i.test(rank)) return "rank-violet";
  if (/expert/i.test(rank)) return "rank-blue";
  if (/specialist/i.test(rank)) return "rank-cyan";
  if (/pupil/i.test(rank)) return "rank-green";
  return "rank-gray";
}

export function CPCompassApp() {
  const [view, setView] = useState<View>("overview");
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot>(demoSnapshot);
  const [connectOpen, setConnectOpen] = useState(false);
  const [handle, setHandle] = useState("tourist");
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [reviewInput, setReviewInput] = useState<ReviewRequest>(initialReview);
  const [review, setReview] = useState<SubmissionReview | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [visibleHints, setVisibleHints] = useState(1);

  useEffect(() => {
    try {
      const savedSnapshot = localStorage.getItem("cp-compass-snapshot");
      const savedCompleted = localStorage.getItem("cp-compass-completed");
      if (savedSnapshot) {
        const parsedSnapshot = JSON.parse(savedSnapshot) as AnalyticsSnapshot;
        if (parsedSnapshot.mode === "live") setSnapshot(parsedSnapshot);
        else {
          setSnapshot(demoSnapshot);
          localStorage.setItem("cp-compass-snapshot", JSON.stringify(demoSnapshot));
        }
      }
      if (savedCompleted) setCompleted(new Set(JSON.parse(savedCompleted) as string[]));
    } catch {
      // A corrupt local preview should never block the application.
    }
  }, []);

  const weekTotal = snapshot.schedule.reduce((sum, day) => sum + day.problems.length, 0);
  const weekCompleted = snapshot.recommendations.filter((problem) => completed.has(problem.id)).length;
  const weakTopics = snapshot.topics.slice(0, 4);
  const initials = snapshot.profile.handle.slice(0, 2).toUpperCase();

  const nextProblem = useMemo(
    () => snapshot.recommendations.find((problem) => !completed.has(problem.id)) ?? snapshot.recommendations[0],
    [completed, snapshot.recommendations],
  );

  function storeSnapshot(value: AnalyticsSnapshot) {
    setSnapshot(value);
    localStorage.setItem("cp-compass-snapshot", JSON.stringify(value));
  }

  async function syncCodeforces(event: FormEvent) {
    event.preventDefault();
    setSyncing(true);
    setSyncError("");
    try {
      const response = await fetch(`/api/codeforces?handle=${encodeURIComponent(handle.trim())}`);
      const payload = await response.json() as AnalyticsSnapshot & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Codeforces sync failed. Please try again.");
      storeSnapshot(payload);
      setConnectOpen(false);
      setView("overview");
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Codeforces sync failed.");
    } finally {
      setSyncing(false);
    }
  }

  function useDemo() {
    storeSnapshot({ ...demoSnapshot, generatedAt: new Date().toISOString() });
    setConnectOpen(false);
    setSyncError("");
  }

  function toggleProblem(id: string) {
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("cp-compass-completed", JSON.stringify([...next]));
      return next;
    });
  }

  async function submitReview(event: FormEvent) {
    event.preventDefault();
    setReviewing(true);
    setReviewError("");
    setReview(null);
    setVisibleHints(1);
    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewInput),
      });
      const payload = await response.json() as SubmissionReview & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Review failed.");
      setReview(payload);
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "Review failed.");
    } finally {
      setReviewing(false);
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setView("overview")} aria-label="CP Compass home">
          <span className="brand-mark"><Compass size={18} strokeWidth={2.5} /></span>
          <span>CP Compass</span>
        </button>

        <nav className="nav" aria-label="Main navigation">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                className={view === item.id ? "nav-item active" : "nav-item"}
                key={item.id}
                onClick={() => setView(item.id)}
              >
                <Icon size={16} /><span>{String(index + 1).padStart(2, "0")}</span>{item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-card">
          <span className="eyebrow">THIS WEEK</span>
          <strong>{weekCompleted} of {weekTotal}</strong>
          <p>problems completed</p>
          <div className="progress-track">
            <span style={{ width: `${weekTotal ? Math.round((weekCompleted / weekTotal) * 100) : 0}%` }} />
          </div>
        </div>

        <div className="profile-chip">
          {snapshot.profile.avatar
            ? <img className="avatar" src={snapshot.profile.avatar} alt={`${snapshot.profile.handle} profile`} />
            : <span className="avatar">{initials}</span>}
          <span><strong>{snapshot.profile.handle}</strong><small>{snapshot.mode === "live" ? "Codeforces connected" : "Demo workspace"}</small></span>
          <button onClick={() => setConnectOpen(true)} aria-label="Change Codeforces profile">•••</button>
        </div>
      </aside>

      <section className="workspace">
        {view === "overview" && (
          <Overview
            snapshot={snapshot}
            weakTopics={weakTopics}
            nextProblem={nextProblem}
            openConnect={() => setConnectOpen(true)}
            openReview={() => setView("review")}
            openPlan={() => setView("practice")}
          />
        )}
        {view === "practice" && (
          <PracticePlan snapshot={snapshot} completed={completed} toggleProblem={toggleProblem} />
        )}
        {view === "insights" && <Insights snapshot={snapshot} />}
        {view === "review" && (
          <ReviewWorkspace
            input={reviewInput}
            setInput={setReviewInput}
            submit={submitReview}
            loading={reviewing}
            error={reviewError}
            review={review}
            visibleHints={visibleHints}
            revealHint={() => setVisibleHints((current) => Math.min(4, current + 1))}
          />
        )}
      </section>

      {connectOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setConnectOpen(false)}>
          <section className="connect-modal" role="dialog" aria-modal="true" aria-labelledby="connect-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setConnectOpen(false)} aria-label="Close"><X size={18} /></button>
            <span className="modal-icon"><RefreshCw size={22} /></span>
            <span className="eyebrow">LIVE CODEFORCES DATA</span>
            <h2 id="connect-title">Connect your handle</h2>
            <p>We import up to 1,000 recent submissions, problem tags, ratings, and verdicts. Nothing is posted to your account.</p>
            <form onSubmit={syncCodeforces}>
              <label htmlFor="handle">Codeforces handle</label>
              <div className="handle-input"><span>codeforces.com/profile/</span><input id="handle" value={handle} onChange={(event) => setHandle(event.target.value)} autoFocus /></div>
              {syncError && <div className="form-error"><CircleAlert size={15} />{syncError}</div>}
              <button className="primary-action" disabled={syncing || handle.trim().length < 3}>
                {syncing ? <><LoaderCircle className="spin" size={16} />Analyzing submissions…</> : <>Connect and analyze <ArrowRight size={16} /></>}
              </button>
              <button className="secondary-action" type="button" onClick={useDemo}>Continue with demo data</button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <header className="section-header">
      <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
      {action}
    </header>
  );
}

function Overview({ snapshot, weakTopics, nextProblem, openConnect, openReview, openPlan }: {
  snapshot: AnalyticsSnapshot;
  weakTopics: AnalyticsSnapshot["topics"];
  nextProblem: AnalyticsSnapshot["recommendations"][number] | undefined;
  openConnect: () => void;
  openReview: () => void;
  openPlan: () => void;
}) {
  return (
    <>
      <header className="topbar">
        <div>
          <span className={snapshot.mode === "live" ? "demo-pill live" : "demo-pill"}>{snapshot.mode === "live" ? "LIVE PROFILE" : "DEMO WORKSPACE"}</span>
          <h1>Turn every wrong answer<br />into your next breakthrough.</h1>
        </div>
        <button className="sync-button" onClick={openConnect}><RefreshCw size={14} /> {snapshot.mode === "live" ? "Sync another handle" : "Sync Codeforces"}</button>
      </header>

      <div className="stat-grid" aria-label="Performance summary">
        <article className="stat-card feature-stat">
          <span className="eyebrow">CURRENT RATING</span>
          <div className="stat-line"><strong>{snapshot.profile.rating || "—"}</strong><span className={`trend ${rankColor(snapshot.profile.rank)}`}>{snapshot.profile.rank}</span></div>
          <p>Peak rating {snapshot.profile.maxRating || "not available"}</p>
          <div className="sparkline" aria-hidden="true">
            {[24, 30, 27, 42, 38, 55, 62, 58, 72, 81].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
          </div>
        </article>
        <article className="stat-card"><span className="eyebrow">SOLVE RATE</span><strong>{snapshot.summary.solveRate}%</strong><p><b>{snapshot.summary.solved} solved</b> from {snapshot.summary.attempted} attempted</p></article>
        <article className="stat-card"><span className="eyebrow">AVG. ATTEMPTS</span><strong>{snapshot.summary.averageAttempts}</strong><p>across accepted problems</p></article>
      </div>

      <div className="dashboard-grid">
        <article className="panel plan-panel">
          <div className="panel-heading"><div><span className="eyebrow">ADAPTIVE PLAN</span><h2>Your week at a glance</h2></div><button className="text-button" onClick={openPlan}>View full plan →</button></div>
          <div className="week-strip">
            {snapshot.schedule.map((item, index) => <button className={index === 0 ? "day active" : "day"} key={item.key} onClick={openPlan}><small>{item.label.slice(0, 3).toUpperCase()}</small><strong>{item.problems.length}</strong><span>problems</span></button>)}
          </div>
          {nextProblem ? (
            <div className="next-problem">
              <div className="problem-index">{nextProblem.index}</div>
              <div className="problem-copy"><span className="eyebrow">NEXT UP · {nextProblem.primaryTag.toUpperCase()}</span><h3>{nextProblem.name}</h3><p>{nextProblem.reason}</p></div>
              <div className="problem-rating"><strong>{nextProblem.rating}</strong><span>rating</span></div>
              <a className="start-button" href={nextProblem.url} target="_blank" rel="noreferrer">Start problem <ExternalLink size={12} /></a>
            </div>
          ) : <div className="empty-note">Sync a handle to generate new problem recommendations.</div>}
        </article>

        <article className="panel weakness-panel">
          <div className="panel-heading"><div><span className="eyebrow">MASTERY MAP</span><h2>Where to focus</h2></div><span className="updated">Updated today</span></div>
          <div className="topic-list">
            {weakTopics.map((topic, index) => (
              <div className="topic-row" key={topic.name}><div><span>{titleCase(topic.name)}</span><strong>{topic.mastery}%</strong></div><div className="topic-track"><span className={["coral", "amber", "blue", "green"][index]} style={{ width: `${topic.mastery}%` }} /></div></div>
            ))}
          </div>
          <div className="coach-note"><span className="coach-icon"><Sparkles size={17} /></span><p><strong>Coach insight</strong>{weakTopics[0] ? `${titleCase(weakTopics[0].name)} is your highest-priority topic; ${weakTopics[0].dominantVerdict.toLowerCase()} is the most common miss.` : "Sync a handle to generate a topic-level coaching insight."}</p></div>
        </article>

        <article className="panel review-panel">
          <div className="review-copy"><span className="eyebrow light">AI SUBMISSION REVIEW</span><h2>Know why your code failed—not just that it failed.</h2><p>Paste a submission and get an evidence-linked diagnosis, complexity review, and four progressive hints.</p><button className="review-button" onClick={openReview}>Review a submission <ArrowRight size={15} /></button></div>
          <div className="code-preview" aria-label="Example code review"><div className="code-toolbar"><span /><span /><span /><small>solution.cpp</small></div><pre><code>{initialReview.code}</code></pre><div className="issue-chip"><span>!</span><p><strong>Integer overflow</strong><small>Use a 64-bit accumulator on line 2.</small></p></div></div>
        </article>
      </div>
    </>
  );
}

function PracticePlan({ snapshot, completed, toggleProblem }: { snapshot: AnalyticsSnapshot; completed: Set<string>; toggleProblem: (id: string) => void }) {
  const total = snapshot.schedule.reduce((sum, day) => sum + day.problems.length, 0);
  const done = snapshot.recommendations.filter((problem) => completed.has(problem.id)).length;
  return (
    <>
      <PageHeader eyebrow="ADAPTIVE PRACTICE" title="Your seven-day plan" description="A balanced mix of weakness work, difficulty progression, and spaced revision." action={<div className="completion-ring"><strong>{done}/{total}</strong><span>complete</span></div>} />
      <div className="plan-layout">
        {snapshot.schedule.map((day, dayIndex) => (
          <article className="plan-day" key={day.key}>
            <header><div><span className="day-number">0{dayIndex + 1}</span><h2>{day.label}</h2></div><span className="focus-chip">{titleCase(day.focus)}</span></header>
            <div className="plan-problems">
              {day.problems.length ? day.problems.map((problem) => {
                const isDone = completed.has(problem.id);
                return (
                  <div className={isDone ? "plan-problem completed" : "plan-problem"} key={problem.id}>
                    <button className="check-button" onClick={() => toggleProblem(problem.id)} aria-label={isDone ? `Mark ${problem.name} incomplete` : `Mark ${problem.name} complete`}>{isDone && <Check size={14} />}</button>
                    <div><span className="problem-meta">{problem.rating} · {titleCase(problem.primaryTag)}</span><h3>{problem.name}</h3><p>{problem.reason}</p></div>
                    <a href={problem.url} target="_blank" rel="noreferrer" aria-label={`Open ${problem.name}`}><ExternalLink size={15} /></a>
                  </div>
                );
              }) : <p className="empty-note">No recommendation available for this day.</p>}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function Insights({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  const maxVerdict = Math.max(...snapshot.verdicts.map((item) => item.count), 1);
  return (
    <>
      <PageHeader eyebrow="PERFORMANCE ANALYSIS" title="Topic insights" description={`Built from ${snapshot.summary.totalSubmissions} recent submissions across ${snapshot.summary.activeDays} active days.`} />
      <div className="insights-grid">
        <article className="panel topics-table-panel">
          <div className="panel-heading"><div><span className="eyebrow">TOPIC MASTERY</span><h2>Weakness-ranked skills</h2></div><Target size={20} /></div>
          <div className="topics-table">
            <div className="table-head"><span>Topic</span><span>Progress</span><span>Solved</span><span>Common miss</span></div>
            {snapshot.topics.slice(0, 10).map((topic, index) => (
              <div className="table-row" key={topic.name}>
                <span><b>{String(index + 1).padStart(2, "0")}</b>{titleCase(topic.name)}</span>
                <span><i><em style={{ width: `${topic.mastery}%` }} /></i>{topic.mastery}%</span>
                <span>{topic.solved}/{topic.attempted}</span>
                <span>{titleCase(topic.dominantVerdict)}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="panel verdict-panel">
          <div className="panel-heading"><div><span className="eyebrow">VERDICT MIX</span><h2>What stops your submissions</h2></div><Code2 size={20} /></div>
          <div className="verdict-list">
            {snapshot.verdicts.slice(0, 6).map((item, index) => (
              <div className="verdict-item" key={item.verdict}><div><span><i className={`verdict-dot verdict-${index}`} />{titleCase(item.verdict)}</span><strong>{item.percentage}%</strong></div><div className="verdict-track"><span className={`verdict-${index}`} style={{ width: `${(item.count / maxVerdict) * 100}%` }} /></div><small>{item.count} submissions</small></div>
            ))}
          </div>
        </article>
      </div>
    </>
  );
}

function ReviewWorkspace({ input, setInput, submit, loading, error, review, visibleHints, revealHint }: {
  input: ReviewRequest;
  setInput: (value: ReviewRequest) => void;
  submit: (event: FormEvent) => void;
  loading: boolean;
  error: string;
  review: SubmissionReview | null;
  visibleHints: number;
  revealHint: () => void;
}) {
  return (
    <>
      <PageHeader eyebrow="AI SUBMISSION REVIEW" title="Debug the reasoning, not just the code" description="Paste the statement and your failed submission. CP Compass identifies the likely root cause and reveals guidance gradually." />
      <div className="review-workspace">
        <form className="review-form panel" onSubmit={submit}>
          <div className="form-row"><label>Problem title<input value={input.problemTitle} onChange={(event) => setInput({ ...input, problemTitle: event.target.value })} placeholder="e.g. Magic Powder — 2" /></label><label>Verdict<select value={input.verdict} onChange={(event) => setInput({ ...input, verdict: event.target.value })}><option>Wrong answer</option><option>Time limit exceeded</option><option>Runtime error</option><option>Memory limit exceeded</option><option>Compilation error</option></select></label></div>
          <label>Problem statement and constraints<textarea className="statement-input" value={input.problemStatement} onChange={(event) => setInput({ ...input, problemStatement: event.target.value })} placeholder="Paste the relevant statement and constraints…" /></label>
          <label>Language<select value={input.language} onChange={(event) => setInput({ ...input, language: event.target.value })}><option>GNU C++17</option><option>Java 17</option><option>Python 3</option><option>Kotlin 1.9</option><option>JavaScript</option></select></label>
          <label>Source code<textarea className="source-input" value={input.code} onChange={(event) => setInput({ ...input, code: event.target.value })} spellCheck={false} /></label>
          {error && <div className="form-error"><CircleAlert size={15} />{error}</div>}
          <button className="primary-action" disabled={loading || !input.code.trim()}>{loading ? <><LoaderCircle className="spin" size={16} />Reviewing logic…</> : <><Sparkles size={16} />Analyze submission</>}</button>
          <p className="privacy-note">Your code is sent to Groq only to generate this review. Add `GROQ_API_KEY` for free-tier AI analysis; otherwise the local deterministic reviewer runs.</p>
        </form>

        <section className={review ? "review-result panel has-review" : "review-result panel"}>
          {!review ? (
            <div className="review-placeholder"><span><SearchCode size={28} /></span><h2>Your diagnosis will appear here</h2><p>The sample submission is ready, so you can try the complete workflow immediately.</p></div>
          ) : (
            <>
              <div className="diagnosis-head"><div><span className="eyebrow">PRIMARY DIAGNOSIS</span><h2>{titleCase(review.category)}</h2></div><span className={review.source === "groq" ? "source-badge ai" : "source-badge"}>{review.source === "groq" ? "Groq AI" : "Offline engine"}</span></div>
              <p className="diagnosis-summary">{review.summary}</p>
              <div className="confidence-row"><span>Confidence</span><div><i style={{ width: `${Math.round(review.confidence * 100)}%` }} /></div><strong>{Math.round(review.confidence * 100)}%</strong></div>
              <div className="complexity-grid"><div><span>TIME</span><strong>{review.timeComplexity}</strong></div><div><span>SPACE</span><strong>{review.spaceComplexity}</strong></div></div>
              <div className="root-cause"><span><CircleAlert size={17} /></span><p><strong>Root cause</strong>{review.rootCause}</p></div>
              <div className="evidence-list"><span className="eyebrow">CODE EVIDENCE</span>{review.evidence.map((item, index) => <div key={`${item.line}-${index}`}><code>Line {item.line}</code><p>{item.detail}</p></div>)}</div>
              <div className="hints-section"><div className="hints-heading"><div><span className="eyebrow">PROGRESSIVE HINTS</span><h3>Reveal only what you need</h3></div><span>{visibleHints}/4</span></div>{review.hints.slice(0, visibleHints).map((hint, index) => <div className="hint-card" key={hint}><span>{index + 1}</span><p>{hint}</p></div>)}{visibleHints < 4 && <button className="secondary-action reveal-button" onClick={revealHint}>Reveal hint {visibleHints + 1} <ChevronRight size={15} /></button>}</div>
              <div className="next-concept"><Target size={17} /><p><span>Study next</span><strong>{review.nextConcept}</strong></p></div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
