export type HonoAnalyticsSummary = {
  totalRequests: number;
  totalTokens: number;
  averageLatency: number;
  estimateCost: number;
};

export type HonoRequestLog = {
  id: number;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latency: number;
  queueTime: number | null;
  estimatedCost: number | null;
  createdAt: string;
};

export type HonoProviderStats = {
  requests: number;
  totalTokens: number;
  averageLatency: number;
  estimatedSpend: number;
};

export type HonoBudgetSummary = {
  budget: number;
  spent: number;
  remaining: number;
  usagePercent: number;
  allowed: boolean;
};

export type DailyGatewayPoint = {
  date: string;
  requests: number;
  tokens: number;
  estimatedSpend: number;
};

export type GatewayProviderSummary = {
  provider: string;
  requests: number;
  totalTokens: number;
  averageLatency: number;
  estimatedSpend: number;
  requestShare: number;
};

export type GatewayDashboardData = {
  summary: HonoAnalyticsSummary;
  budget: HonoBudgetSummary;
  providers: GatewayProviderSummary[];
  dailyActivity: DailyGatewayPoint[];
  recentRequests: HonoRequestLog[];
};

function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;

  return date.toISOString().split("T")[0];
}

export function transformGatewayDashboardData({
  summary,
  providers,
  daily,
  budget,
  recentRequests,
}: {
  summary: HonoAnalyticsSummary;
  providers: Record<string, HonoProviderStats>;
  daily: Record<string, { requests: number; tokens: number; estimatedSpend: number }>;
  budget: HonoBudgetSummary;
  recentRequests: HonoRequestLog[];
}): GatewayDashboardData {
  const totalRequests = summary.totalRequests || 0;

  const providerSummaries = Object.entries(providers)
    .map(([provider, stats]) => ({
      provider,
      requests: stats.requests,
      totalTokens: stats.totalTokens,
      averageLatency: stats.averageLatency,
      estimatedSpend: stats.estimatedSpend,
      requestShare: totalRequests > 0 ? Number(((stats.requests / totalRequests) * 100).toFixed(2)) : 0,
    }))
    .sort((left, right) => right.requests - left.requests);

  const dailyActivity = Object.entries(daily)
    .map(([date, stats]) => ({
      date,
      requests: stats.requests,
      tokens: stats.tokens,
      estimatedSpend: Number(stats.estimatedSpend.toFixed(8)),
    }))
    .sort((left, right) => formatDate(left.date).localeCompare(formatDate(right.date)));

  return {
    summary,
    budget,
    providers: providerSummaries,
    dailyActivity,
    recentRequests: recentRequests
      .slice()
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
  };
}
