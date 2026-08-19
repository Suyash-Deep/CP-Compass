import type { AnalyticsSnapshot, Recommendation, TopicInsight } from "./types";

const topicData = [
  ["chinese remainder theorem", 3, 2, 67, 48, 52, 2233, "Wrong answer"],
  ["probabilities", 21, 20, 95, 85, 15, 2681, "Time limit"],
  ["interactive", 41, 39, 95, 86, 14, 2443, "Time limit"],
  ["graphs", 83, 80, 96, 90, 10, 2378, "Time limit"],
  ["ternary search", 6, 6, 100, 90, 10, 2133, "Runtime error"],
  ["binary search", 86, 85, 99, 91, 9, 2131, "Time limit"],
  ["data structures", 142, 139, 98, 92, 8, 2227, "Wrong answer"],
  ["bitmasks", 66, 64, 97, 92, 8, 2192, "Time limit"],
  ["matrices", 10, 10, 100, 92, 8, 2600, "Time limit"],
  ["2-sat", 6, 6, 100, 93, 7, 2117, "Time limit"],
  ["dp", 210, 206, 98, 94, 6, 2267, "Wrong answer"],
  ["games", 35, 34, 97, 94, 6, 1974, "Wrong answer"],
  ["divide and conquer", 30, 29, 97, 94, 6, 2497, "Wrong answer"],
  ["flows", 10, 10, 100, 94, 6, 2780, "Wrong answer"],
  ["dfs and similar", 88, 86, 98, 95, 5, 2267, "Wrong answer"],
  ["number theory", 61, 60, 98, 95, 5, 1857, "Wrong answer"],
  ["two pointers", 50, 49, 98, 95, 5, 1914, "Wrong answer"],
  ["strings", 46, 45, 98, 95, 5, 1624, "Wrong answer"],
  ["greedy", 291, 286, 98, 96, 4, 1741, "Wrong answer"],
  ["math", 259, 255, 98, 96, 4, 1832, "Wrong answer"],
  ["constructive algorithms", 163, 162, 99, 96, 4, 1914, "Wrong answer"],
  ["implementation", 161, 160, 99, 96, 4, 1722, "Wrong answer"],
  ["combinatorics", 85, 83, 98, 97, 3, 2443, "Wrong answer"],
  ["*special", 58, 57, 98, 97, 3, 2089, "Time limit"],
  ["dsu", 34, 34, 100, 97, 3, 2332, "Wrong answer"],
  ["shortest paths", 12, 12, 100, 97, 3, 2225, "Wrong answer"],
  ["hashing", 12, 12, 100, 97, 3, 2467, "Wrong answer"],
  ["brute force", 146, 145, 99, 98, 2, 1860, "Wrong answer"],
  ["trees", 82, 82, 100, 98, 2, 2365, "Wrong answer"],
  ["sortings", 75, 74, 99, 98, 2, 1741, "Wrong answer"],
  ["graph matchings", 9, 9, 100, 98, 2, 2500, "Wrong answer"],
  ["fft", 9, 9, 100, 98, 2, 2822, "Runtime error"],
  ["schedules", 4, 4, 100, 98, 2, 1500, "Accepted"],
  ["string suffix structures", 3, 3, 100, 98, 2, 2633, "Wrong answer"],
  ["meet-in-the-middle", 3, 3, 100, 98, 2, 2733, "Accepted"],
  ["geometry", 14, 14, 100, 99, 1, 2393, "Wrong answer"],
] as const;

const topics: TopicInsight[] = topicData.map(([name, attempted, solved, solveRate, mastery, weakness, averageRating, dominantVerdict]) => ({
  name,
  attempted,
  solved,
  solveRate,
  mastery,
  weakness,
  averageRating,
  dominantVerdict,
}));

const recommendationData: Array<[string, string, number, string, number, string[], string]> = [
  ["1993-F1", "Dyn-scripted Robot (Easy Version)", 1993, "F1", 2400, ["brute force", "chinese remainder theorem", "constructive algorithms", "math", "number theory"], "chinese remainder theorem"],
  ["2223-C", "Zhily and Signpost", 2223, "C", 2300, ["chinese remainder theorem", "dfs and similar", "math", "number theory", "trees"], "chinese remainder theorem"],
  ["993-E", "Nikita and Order Statistics", 993, "E", 2300, ["chinese remainder theorem", "fft", "math"], "chinese remainder theorem"],
  ["1500-B", "Two chandeliers", 1500, "B", 2200, ["binary search", "brute force", "chinese remainder theorem", "math", "number theory"], "chinese remainder theorem"],
  ["1117-E", "Decypher the String", 1117, "E", 2200, ["bitmasks", "chinese remainder theorem", "constructive algorithms", "interactive", "math"], "chinese remainder theorem"],
  ["1536-F", "Omkar and Akmar", 1536, "F", 2600, ["chinese remainder theorem", "combinatorics", "constructive algorithms", "fft", "games", "geometry", "math", "meet-in-the-middle", "string suffix structures"], "chinese remainder theorem"],
  ["1748-D", "ConstructOR", 1748, "D", 2100, ["bitmasks", "chinese remainder theorem", "combinatorics", "constructive algorithms", "math", "number theory"], "chinese remainder theorem"],
  ["919-E", "Congruence Equation", 919, "E", 2100, ["chinese remainder theorem", "math", "number theory"], "chinese remainder theorem"],
  ["906-D", "Power Tower", 906, "D", 2700, ["chinese remainder theorem", "math", "number theory"], "chinese remainder theorem"],
  ["1665-D", "GCD Guess", 1665, "D", 2000, ["bitmasks", "chinese remainder theorem", "constructive algorithms", "games", "interactive", "math", "number theory"], "chinese remainder theorem"],
  ["1438-C", "Engineer Artem", 1438, "C", 2000, ["2-sat", "chinese remainder theorem", "constructive algorithms", "fft", "flows"], "chinese remainder theorem"],
  ["1993-F2", "Dyn-scripted Robot (Hard Version)", 1993, "F2", 2800, ["chinese remainder theorem", "math", "number theory"], "chinese remainder theorem"],
  ["722-F", "Cyclic Cipher", 722, "F", 2800, ["chinese remainder theorem", "data structures", "implementation", "number theory", "two pointers"], "chinese remainder theorem"],
  ["2174-C1", "Beautiful Patterns (Easy Version)", 2174, "C1", 2400, ["combinatorics", "math", "probabilities"], "probabilities"],
];

const recommendations: Recommendation[] = recommendationData.map(([id, name, contestId, index, rating, tags, primaryTag]) => ({
  id,
  name,
  contestId,
  index,
  rating,
  tags,
  primaryTag,
  reason: `Targets ${primaryTag} near your current 2400-rated practice range.`,
  url: `https://codeforces.com/problemset/problem/${contestId}/${index}`,
}));

const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const distribution = [2, 2, 1, 2, 2, 3, 2];
let recommendationCursor = 0;
const schedule = dayLabels.map((label, index) => {
  const problems = recommendations.slice(recommendationCursor, recommendationCursor + distribution[index]);
  recommendationCursor += distribution[index];
  return {
    key: label.slice(0, 3).toLowerCase(),
    label,
    focus: problems[0]?.primaryTag ?? "revision",
    problems,
  };
});

export const demoSnapshot: AnalyticsSnapshot = {
  mode: "demo",
  generatedAt: new Date().toISOString(),
  profile: {
    handle: "tourist",
    rating: 3530,
    maxRating: 4009,
    rank: "legendary grandmaster",
    avatar: "https://userpic.codeforces.org/422/title/50a270ed4a722867.jpg",
  },
  summary: {
    totalSubmissions: 1000,
    attempted: 694,
    solved: 677,
    solveRate: 98,
    averageAttempts: 1.4,
    activeDays: 104,
  },
  topics,
  verdicts: [
    { verdict: "Accepted", count: 741, percentage: 74 },
    { verdict: "Wrong answer", count: 138, percentage: 14 },
    { verdict: "Time limit", count: 67, percentage: 7 },
    { verdict: "Runtime error", count: 21, percentage: 2 },
    { verdict: "Compilation error", count: 20, percentage: 2 },
    { verdict: "Memory limit", count: 8, percentage: 1 },
    { verdict: "Skipped", count: 4, percentage: 0 },
    { verdict: "challenged", count: 1, percentage: 0 },
  ],
  recommendations,
  schedule,
};
