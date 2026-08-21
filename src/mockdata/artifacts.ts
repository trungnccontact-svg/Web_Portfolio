export interface ClaudeArtifact {
  id: string;
  title: string;
  url: string;
  category: string;
  createdAt: string;
  description?: string;
  iconName?: "user" | "fileCheck" | "trendingUp" | "cpu" | "zap" | "coins" | "shoppingBag" | "bookOpen";
  isPinned?: boolean;
}

export const CLAUDE_ARTIFACTS: ClaudeArtifact[] = [
  {
    id: "developer-portfolio",
    title: "Developer Portfolio Prompt",
    url: "https://claude.ai/public/artifacts/91b72624-43a1-44b2-8351-96e345aac649",
    category: "AI Tool",
    createdAt: "2026-08-01",
    description: "Interactive portfolio layout generator prompt for Claude.",
    iconName: "user",
  },
  {
    id: "vietnam-cv-optimizer",
    title: "Vietnam CV Optimizer",
    url: "https://claude.ai/public/artifacts/c174a083-63d1-48f7-aaca-8c293e4a810e",
    category: "CV & Career",
    createdAt: "2026-08-01",
    description: "Tailored CV scanner and optimizer for Vietnamese tech roles.",
    iconName: "fileCheck",
  },
  {
    id: "it-market-insights",
    title: "IT Market Insights Dashboard",
    url: "https://claude.ai/public/artifacts/b6bc0fc2-110c-4a07-bd12-785ac058b0f3",
    category: "Analytics",
    createdAt: "2026-08-02",
    description: "Real-time trends and salary telemetry analyzer.",
    iconName: "trendingUp",
  },
  {
    id: "free-llm-ranker",
    title: "Free LLM Performance Ranker",
    url: "https://claude.ai/public/artifacts/2adc7758-6eea-44ee-b669-d9f167a99006",
    category: "AI Tool",
    createdAt: "2026-08-02",
    description: "Benchmark comparison tool for open-source and free LLM APIs.",
    iconName: "cpu",
  },
  {
    id: "rsi-intelligence-hub",
    title: "RSI Trading Intelligence Hub",
    url: "https://claude.ai/public/artifacts/29896560-2047-43ec-ab34-e8d3e86d6a7b",
    category: "Finance",
    createdAt: "2026-08-03",
    description: "Technical analysis and momentum indicator dashboard.",
    iconName: "zap",
  },
  {
    id: "vn-stock-prompts",
    title: "VN Stock Market Analyzer",
    url: "https://claude.ai/public/artifacts/7319a629-9844-4427-bf42-dab50f585de5?zarsrc=30&utm_source=zalo&utm_medium=zalo&utm_campaign=zalo",
    category: "Finance",
    createdAt: "2026-08-03",
    description: "Financial analysis & stock signal generator for Vietnam market.",
    iconName: "coins",
  },
  {
    id: "shopee-spending",
    title: "Shopee Spending Tracker",
    url: "https://claude.ai/public/artifacts/8b1c961d-5bb2-4f87-88a6-98de54667a47?zarsrc=30&utm_source=zalo&utm_medium=zalo&utm_campaign=zalo",
    category: "Utilities",
    createdAt: "2026-08-03",
    description: "Analyze e-commerce spending patterns and total expenses.",
    iconName: "shoppingBag",
  },
  {
    id: "english-deep-learning",
    title: "English Grammar Assistant",
    url: "https://claude.ai/public/artifacts/b7889082-bc1d-4a01-aa2d-db9920a294b5",
    category: "Education",
    createdAt: "2026-08-03",
    description: "Automated grammar breakdown and vocabulary extraction system.",
    iconName: "bookOpen",
  },
];
