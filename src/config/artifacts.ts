export interface ClaudeArtifact {
  id: string;
  url: string;
  iconName: "user" | "fileCheck" | "trendingUp" | "cpu" | "zap" | "coins" | "shoppingBag" | "bookOpen";
}

export const CLAUDE_ARTIFACTS: ClaudeArtifact[] = [
  {
    id: "developer-portfolio",
    url: "https://claude.ai/public/artifacts/91b72624-43a1-44b2-8351-96e345aac649",
    iconName: "user",
  },
  {
    id: "vietnam-cv-optimizer",
    url: "https://claude.ai/public/artifacts/c174a083-63d1-48f7-aaca-8c293e4a810e",
    iconName: "fileCheck",
  },
  {
    id: "it-market-insights",
    url: "https://claude.ai/public/artifacts/b6bc0fc2-110c-4a07-bd12-785ac058b0f3",
    iconName: "trendingUp",
  },
  {
    id: "free-llm-ranker",
    url: "https://claude.ai/public/artifacts/2adc7758-6eea-44ee-b669-d9f167a99006",
    iconName: "cpu",
  },
  {
    id: "rsi-intelligence-hub",
    url: "https://claude.ai/public/artifacts/29896560-2047-43ec-ab34-e8d3e86d6a7b",
    iconName: "zap",
  },
  {
    id: "vn-stock-prompts",
    url: "https://claude.ai/public/artifacts/7319a629-9844-4427-bf42-dab50f585de5?zarsrc=30&utm_source=zalo&utm_medium=zalo&utm_campaign=zalo",
    iconName: "coins",
  },
  {
    id: "shopee-spending",
    url: "https://claude.ai/public/artifacts/8b1c961d-5bb2-4f87-88a6-98de54667a47?zarsrc=30&utm_source=zalo&utm_medium=zalo&utm_campaign=zalo",
    iconName: "shoppingBag",
  },
  {
    id: "english-deep-learning",
    url: "https://claude.ai/public/artifacts/b7889082-bc1d-4a01-aa2d-db9920a294b5",
    iconName: "bookOpen",
  },
];
