import { NextResponse } from "next/server";
import {
  transformGatewayDashboardData,
  type HonoAnalyticsSummary,
  type HonoBudgetSummary,
  type HonoProviderStats,
  type HonoRequestLog,
} from "@/lib/gateway-dashboard";

export const dynamic = "force-dynamic";

const honoBaseUrl = process.env.HONO_API_URL ?? "http://localhost:3001";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(new URL(path, honoBaseUrl), { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function GET() {
  try {
    const [summary, providerStats, dailyStats, budget, recentRequests] = await Promise.all([
      fetchJson<HonoAnalyticsSummary>("/analytics"),
      fetchJson<Record<string, HonoProviderStats>>("/analytics/providers"),
      fetchJson<Record<string, { requests: number; tokens: number; estimatedSpend: number }>>("/analytics/daily"),
      fetchJson<HonoBudgetSummary>("/analytics/budget"),
      fetchJson<HonoRequestLog[]>("/analytics/recent"),
    ]);

    const data = transformGatewayDashboardData({
      summary,
      providers: providerStats,
      daily: dailyStats,
      budget,
      recentRequests,
    });

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Failed to build gateway dashboard data:", error);

    return NextResponse.json(
      {
        summary: { totalRequests: 0, totalTokens: 0, averageLatency: 0, estimateCost: 0 },
        budget: { budget: 0, spent: 0, remaining: 0, usagePercent: 0, allowed: true },
        providers: [],
        dailyActivity: [],
        recentRequests: [],
      },
      { status: 200 },
    );
  }
}
