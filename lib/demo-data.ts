import type { AnalyticsSnapshot } from "./types";

const demoRecommendations = [
  ["1474-B", "Different Divisors", 1474, "B", 1400, "number theory"],
  ["670-D2", "Magic Powder — 2", 670, "D2", 1500, "binary search"],
  ["166-E", "Tetrahedron", 166, "E", 1500, "dynamic programming"],
  ["545-C", "Woodcutters", 545, "C", 1500, "greedy"],
  ["580-C", "Kefa and Park", 580, "C", 1500, "graphs"],
  ["1353-D", "Constructing the Array", 1353, "D", 1600, "data structures"],
  ["1462-C", "Unique Number", 1462, "C", 1300, "greedy"],
  ["702-C", "Cellular Network", 702, "C", 1500, "binary search"],
  ["550-C", "Divisibility by Eight", 550, "C", 1500, "dynamic programming"],
  ["977-E", "Cyclic Components", 977, "E", 1500, "graphs"],
  ["1099-C", "Postcard", 1099, "C", 1500, "strings"],
  ["1141-D", "Colored Boots", 1141, "D", 1500, "greedy"],
  ["165-B", "Burning Midnight Oil", 165, "B", 1400, "binary search"],
  ["1385-D", "A-B Palindrome", 1385, "D", 1600, "divide and conquer"],
] as const;

const recommendations = demoRecommendations.map(([id, name, contestId, index, rating, tag]) => ({
  id,
  name,
  contestId,
  index,
  rating,
  tags: [tag],
  primaryTag: tag,
  reason: `Targets ${tag} near your current practice range.`,
  url: `https://codeforces.com/problemset/problem/${contestId}/${index}`,
}));

export const demoSnapshot: AnalyticsSnapshot = {
  mode: "demo",
  generatedAt: new Date().toISOString(),
  profile: { handle: "deepsuyash022", rating: 1684, maxRating: 1742, rank: "specialist" },
  summary: { totalSubmissions: 843, attempted: 418, solved: 284, solveRate: 68, averageAttempts: 2.3, activeDays: 126 },
  topics: [
    { name: "dynamic programming", attempted: 38, solved: 18, solveRate: 47, mastery: 42, weakness: 58, averageRating: 1510, dominantVerdict: "Wrong answer" },
    { name: "binary search", attempted: 31, solved: 19, solveRate: 61, mastery: 58, weakness: 42, averageRating: 1480, dominantVerdict: "Wrong answer" },
    { name: "graphs", attempted: 47, solved: 36, solveRate: 77, mastery: 76, weakness: 24, averageRating: 1560, dominantVerdict: "Time limit" },
    { name: "greedy", attempted: 59, solved: 51, solveRate: 86, mastery: 84, weakness: 16, averageRating: 1590, dominantVerdict: "Wrong answer" },
    { name: "implementation", attempted: 84, solved: 69, solveRate: 82, mastery: 79, weakness: 21, averageRating: 1430, dominantVerdict: "Wrong answer" },
  ],
  verdicts: [
    { verdict: "Accepted", count: 284, percentage: 34 },
    { verdict: "Wrong answer", count: 382, percentage: 45 },
    { verdict: "Time limit", count: 91, percentage: 11 },
    { verdict: "Compilation error", count: 52, percentage: 6 },
    { verdict: "Runtime error", count: 34, percentage: 4 },
  ],
  recommendations,
  schedule: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((label, index) => ({
    key: label.slice(0, 3).toLowerCase(),
    label,
    focus: recommendations[index * 2]?.primaryTag ?? "revision",
    problems: recommendations.slice(index * 2, index * 2 + 2),
  })),
};
