import type {
  AnalyticsSnapshot,
  CodeforcesBundle,
  CodeforcesProblem,
  CodeforcesSubmission,
  Recommendation,
  ScheduleDay,
  TopicInsight,
} from "./types";

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const VERDICT_LABELS: Record<string, string> = {
  OK: "Accepted",
  WRONG_ANSWER: "Wrong answer",
  TIME_LIMIT_EXCEEDED: "Time limit",
  MEMORY_LIMIT_EXCEEDED: "Memory limit",
  COMPILATION_ERROR: "Compilation error",
  RUNTIME_ERROR: "Runtime error",
  SKIPPED: "Skipped",
};

function problemId(problem: CodeforcesProblem) {
  return `${problem.contestId ?? "custom"}-${problem.index}`;
}

function dominantVerdict(submissions: CodeforcesSubmission[]) {
  const counts = new Map<string, number>();
  for (const submission of submissions) {
    if (!submission.verdict || submission.verdict === "OK") continue;
    counts.set(submission.verdict, (counts.get(submission.verdict) ?? 0) + 1);
  }
  const [verdict] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? ["OK", 0];
  return VERDICT_LABELS[verdict] ?? verdict.replaceAll("_", " ").toLowerCase();
}

function calculateTopics(submissions: CodeforcesSubmission[]): TopicInsight[] {
  const grouped = new Map<string, CodeforcesSubmission[]>();
  for (const submission of submissions) {
    for (const tag of submission.problem.tags) {
      const current = grouped.get(tag) ?? [];
      current.push(submission);
      grouped.set(tag, current);
    }
  }

  return [...grouped.entries()]
    .map(([name, tagged]) => {
      const attempts = new Map<string, CodeforcesSubmission[]>();
      for (const submission of tagged) {
        const id = problemId(submission.problem);
        const current = attempts.get(id) ?? [];
        current.push(submission);
        attempts.set(id, current);
      }
      const problems = [...attempts.values()];
      const solved = problems.filter((items) => items.some((item) => item.verdict === "OK")).length;
      const attempted = problems.length;
      const solveRate = attempted ? Math.round((solved / attempted) * 100) : 0;
      const averageAttempts = attempted
        ? problems.reduce((sum, items) => sum + items.length, 0) / attempted
        : 0;
      const ratings = problems
        .map((items) => items[0]?.problem.rating)
        .filter((rating): rating is number => typeof rating === "number");
      const averageRating = ratings.length
        ? Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length)
        : null;
      const mastery = Math.max(0, Math.min(100, Math.round(solveRate - Math.max(0, averageAttempts - 1) * 7)));

      return {
        name,
        attempted,
        solved,
        solveRate,
        mastery,
        weakness: 100 - mastery,
        averageRating,
        dominantVerdict: dominantVerdict(tagged),
      };
    })
    .filter((topic) => topic.attempted >= 2)
    .sort((a, b) => b.weakness - a.weakness || b.attempted - a.attempted);
}

function createRecommendations(
  bundle: CodeforcesBundle,
  topics: TopicInsight[],
): Recommendation[] {
  const attempted = new Set(bundle.submissions.map((submission) => problemId(submission.problem)));
  const targetRating = Math.max(800, Math.min(2400, (bundle.user.rating ?? 1400) - 100));
  const weakTags = topics.length
    ? topics.slice(0, 6).map((topic) => topic.name)
    : ["implementation", "greedy", "math", "binary search"];

  return bundle.problems
    .filter((problem) => problem.contestId && problem.rating && !attempted.has(problemId(problem)))
    .filter((problem) => weakTags.some((tag) => problem.tags.includes(tag)))
    .map((problem) => {
      const primaryTag = weakTags.find((tag) => problem.tags.includes(tag)) ?? problem.tags[0] ?? "implementation";
      const topicRank = Math.max(0, weakTags.indexOf(primaryTag));
      const ratingDistance = Math.abs((problem.rating ?? targetRating) - targetRating);
      return { problem, primaryTag, score: topicRank * 500 + ratingDistance };
    })
    .sort((a, b) => a.score - b.score || (a.problem.rating ?? 0) - (b.problem.rating ?? 0))
    .slice(0, 14)
    .map(({ problem, primaryTag }) => ({
      id: problemId(problem),
      name: problem.name,
      contestId: problem.contestId!,
      index: problem.index,
      rating: problem.rating!,
      tags: problem.tags,
      primaryTag,
      reason: `Targets ${primaryTag} near your current ${targetRating}-rated practice range.`,
      url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
    }));
}

function createSchedule(recommendations: Recommendation[], topics: TopicInsight[]): ScheduleDay[] {
  const distribution = [2, 2, 1, 2, 2, 3, 2];
  let cursor = 0;
  return DAY_LABELS.map((label, index) => {
    const count = distribution[index];
    const problems = recommendations.slice(cursor, cursor + count);
    cursor += count;
    return {
      key: label.slice(0, 3).toLowerCase(),
      label,
      focus: problems[0]?.primaryTag ?? topics[index % Math.max(1, topics.length)]?.name ?? "Revision",
      problems,
    };
  });
}

export function buildAnalyticsSnapshot(bundle: CodeforcesBundle): AnalyticsSnapshot {
  const groups = new Map<string, CodeforcesSubmission[]>();
  for (const submission of bundle.submissions) {
    const id = problemId(submission.problem);
    const current = groups.get(id) ?? [];
    current.push(submission);
    groups.set(id, current);
  }
  const problemGroups = [...groups.values()];
  const solved = problemGroups.filter((items) => items.some((item) => item.verdict === "OK")).length;
  const attempted = problemGroups.length;
  const solvedAttempts = problemGroups.filter((items) => items.some((item) => item.verdict === "OK"));
  const averageAttempts = solvedAttempts.length
    ? solvedAttempts.reduce((sum, items) => sum + items.length, 0) / solvedAttempts.length
    : 0;
  const activeDays = new Set(
    bundle.submissions.map((submission) => new Date(submission.creationTimeSeconds * 1000).toISOString().slice(0, 10)),
  ).size;
  const verdictCounts = new Map<string, number>();
  for (const submission of bundle.submissions) {
    const verdict = submission.verdict ?? "UNKNOWN";
    verdictCounts.set(verdict, (verdictCounts.get(verdict) ?? 0) + 1);
  }
  const topics = calculateTopics(bundle.submissions);
  const recommendations = createRecommendations(bundle, topics);

  return {
    mode: "live",
    generatedAt: new Date().toISOString(),
    profile: {
      handle: bundle.user.handle,
      rating: bundle.user.rating ?? 0,
      maxRating: bundle.user.maxRating ?? bundle.user.rating ?? 0,
      rank: bundle.user.rank ?? "unrated",
      avatar: bundle.user.titlePhoto,
    },
    summary: {
      totalSubmissions: bundle.submissions.length,
      attempted,
      solved,
      solveRate: attempted ? Math.round((solved / attempted) * 100) : 0,
      averageAttempts: Number(averageAttempts.toFixed(1)),
      activeDays,
    },
    topics,
    verdicts: [...verdictCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([verdict, count]) => ({
        verdict: VERDICT_LABELS[verdict] ?? verdict.replaceAll("_", " ").toLowerCase(),
        count,
        percentage: Math.round((count / Math.max(1, bundle.submissions.length)) * 100),
      })),
    recommendations,
    schedule: createSchedule(recommendations, topics),
  };
}
