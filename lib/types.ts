export type TopicInsight = {
  name: string;
  attempted: number;
  solved: number;
  solveRate: number;
  mastery: number;
  weakness: number;
  averageRating: number | null;
  dominantVerdict: string;
};

export type Recommendation = {
  id: string;
  name: string;
  contestId: number;
  index: string;
  rating: number;
  tags: string[];
  primaryTag: string;
  reason: string;
  url: string;
};

export type ScheduleDay = {
  key: string;
  label: string;
  focus: string;
  problems: Recommendation[];
};

export type AnalyticsSnapshot = {
  mode: "live" | "demo";
  generatedAt: string;
  profile: {
    handle: string;
    rating: number;
    maxRating: number;
    rank: string;
    avatar?: string;
  };
  summary: {
    totalSubmissions: number;
    attempted: number;
    solved: number;
    solveRate: number;
    averageAttempts: number;
    activeDays: number;
  };
  topics: TopicInsight[];
  verdicts: Array<{ verdict: string; count: number; percentage: number }>;
  recommendations: Recommendation[];
  schedule: ScheduleDay[];
};

export type ReviewRequest = {
  problemTitle: string;
  problemStatement: string;
  language: string;
  verdict: string;
  code: string;
};

export type ReviewEvidence = {
  line: number;
  detail: string;
};

export type SubmissionReview = {
  source: "openai" | "offline";
  category: string;
  confidence: number;
  summary: string;
  rootCause: string;
  timeComplexity: string;
  spaceComplexity: string;
  evidence: ReviewEvidence[];
  hints: [string, string, string, string];
  nextConcept: string;
};

export type CodeforcesUser = {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  titlePhoto?: string;
};

export type CodeforcesProblem = {
  contestId?: number;
  index: string;
  name: string;
  rating?: number;
  tags: string[];
};

export type CodeforcesSubmission = {
  id: number;
  creationTimeSeconds: number;
  verdict?: string;
  programmingLanguage: string;
  problem: CodeforcesProblem;
};

export type CodeforcesBundle = {
  user: CodeforcesUser;
  submissions: CodeforcesSubmission[];
  problems: CodeforcesProblem[];
};
