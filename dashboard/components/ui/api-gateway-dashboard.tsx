"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import { useRealtimeGatewayData } from "@/demos/hooks/useRealtimeGatewayData";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Activity,
  Clock,
  Database,
  ArrowUpRight,
  Gauge,
  KeyRound,
  MessageSquareMore,
  Server,
  ShieldAlert,
  TimerReset,
  Zap,
} from "lucide-react";
import type { GatewayProviderSummary, HonoRequestLog } from "@/lib/gateway-dashboard";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatLatency = (value: number) => `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ms`;

const formatTimestamp = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const getBudgetStatus = (usagePercent: number) => {
  if (usagePercent >= 90) {
    return {
      label: "Critical",
      variant: "destructive" as const,
      accent: "text-red-500",
      iconTone: "bg-red-500/10 text-red-500 ring-red-500/20",
      gradient: "from-red-500 to-rose-400",
      ringColor: "#ef4444",
    };
  }

  if (usagePercent >= 70) {
    return {
      label: "Warning",
      variant: "secondary" as const,
      accent: "text-amber-500",
      iconTone: "bg-amber-500/10 text-amber-500 ring-amber-500/20",
      gradient: "from-amber-500 to-orange-400",
      ringColor: "#f59e0b",
    };
  }

  return {
    label: "Healthy",
    variant: "secondary" as const,
    accent: "text-emerald-500",
    iconTone: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20",
    gradient: "from-emerald-500 to-emerald-400",
    ringColor: "#10b981",
  };
};

interface MetricCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  description?: string;
  valueClassName?: string;
  badge?: React.ReactNode;
  accentClassName?: string;
  iconToneClassName?: string;
}

const MetricCard: FC<MetricCardProps> = ({ title, value, icon, description, valueClassName, badge, accentClassName, iconToneClassName }) => (
  <Card className="group relative flex-1 min-w-0 overflow-hidden rounded-2xl border-border/60 bg-card/80 shadow-[0_1px_0_rgba(255,255,255,0.02),0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-border/80 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
    <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accentClassName ?? "from-transparent via-border to-transparent"}`} />
    <CardHeader className="flex items-start px-4 pb-2 pt-4">
      <div className="flex w-full items-start gap-3">
        {icon ? (
          <div className={`rounded-full border border-border/60 p-2 shadow-sm ${iconToneClassName ?? "bg-background/80 text-foreground ring-1 ring-border/20"}`}>
            <span className="flex items-center justify-center">{icon}</span>
          </div>
        ) : null}
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle className="text-sm font-medium tracking-wide text-muted-foreground">{title}</CardTitle>
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
      </div>
    </CardHeader>
    <CardContent className="px-4 pb-4">
      <div className="flex items-end justify-between gap-3">
        <div className={`text-2xl font-semibold tracking-tight lg:text-[2rem] ${valueClassName ?? ""}`}>{value}</div>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>
    </CardContent>
  </Card>
);

interface SummaryChartPoint {
  date: string;
  requests: number;
  estimatedSpend: number;
  tokens: number;
}

interface ProviderChartPoint {
  provider: string;
  requests: number;
}

const GatewayChart: FC<{ data: SummaryChartPoint[] }> = ({ data }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const syncTheme = () => setIsDark(document.documentElement.dataset.theme === "dark");

    syncTheme();
    const observer = new MutationObserver(syncTheme);

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => observer.disconnect();
  }, []);

  const colors = {
    grid: isDark ? "#374151" : "#e5e7eb",
    axis: isDark ? "#9ca3af" : "#6b7280",
    tooltipBg: isDark ? "#1f2937" : "#ffffff",
    tooltipBorder: isDark ? "#374151" : "#d1d5db",
    tooltipText: isDark ? "#f9fafb" : "#111827",
    legend: isDark ? "#9ca3af" : "#6b7280",
  };

  return (
    <Card className="flex-1 min-w-0 overflow-hidden rounded-2xl border-border/60 bg-card/80 shadow-[0_1px_0_rgba(255,255,255,0.02),0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur">
      <CardHeader className="px-4 pt-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <span className="rounded-full bg-blue-500/10 p-2 text-blue-600 ring-1 ring-blue-500/20">
            <Activity className="h-4 w-4" />
          </span>
          Request and Spend Trend
        </CardTitle>
        <CardDescription>Request velocity and budget pressure across the live backend analytics stream.</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ChartContainer
          id="gateway-trend"
          config={{
            requests: { label: "Requests", color: "#3b82f6" },
            estimatedSpend: { label: "Estimated Spend", color: "#8b5cf6" },
            tokens: { label: "Tokens", color: "#06b6d4" },
          }}
          className="h-[280px] w-full aspect-auto"
        >
          <ComposedChart data={data} margin={{ top: 12, right: 18, left: -4, bottom: 6 }}>
            <defs>
              <linearGradient id="requestsGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.08} />
              </linearGradient>
              <linearGradient id="spendGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" opacity={0.45} />
            <XAxis dataKey="date" stroke={colors.axis} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke={colors.axis} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="right" orientation="right" stroke={colors.axis} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="rounded-xl border-border/60 bg-popover/95 shadow-xl backdrop-blur"
                  labelClassName="text-sm"
                  formatter={(value: any, name: any) => {
                    if (name === "estimatedSpend") {
                      return [formatCurrency(Number(value)), "Estimated Spend"];
                    }

                    return [Number(value).toLocaleString(), name === "requests" ? "Requests" : "Tokens"];
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent className="justify-start gap-6 pt-3 text-xs" />} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="requests"
              stroke="url(#requestsGradient)"
              strokeWidth={2.5}
              dot={false}
              strokeLinecap="round"
              name="Requests"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="estimatedSpend"
              stroke="url(#spendGradient)"
              strokeWidth={2.5}
              dot={false}
              strokeLinecap="round"
              name="Estimated Spend"
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const ProviderChart: FC<{ data: ProviderChartPoint[] }> = ({ data }) => {
  return (
    <Card className="flex-1 min-w-0 overflow-hidden rounded-2xl border-border/60 bg-card/80 shadow-[0_1px_0_rgba(255,255,255,0.02),0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur">
      <CardHeader className="px-4 pt-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <span className="rounded-full bg-emerald-500/10 p-2 text-emerald-600 ring-1 ring-emerald-500/20">
            <Server className="h-4 w-4" />
          </span>
          Provider Distribution
        </CardTitle>
        <CardDescription>How traffic is distributed across providers in production.</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ChartContainer id="provider-dist" config={{ requests: { label: "Requests", color: "#10b981" } }} className="h-[280px] w-full aspect-auto">
          <BarChart data={data} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="providerGradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.95} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.45} />
            <XAxis dataKey="provider" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="rounded-xl border-border/60 bg-popover/95 shadow-xl backdrop-blur"
                  formatter={(value: any) => [`${Number(value).toLocaleString()} requests`, "Requests"]}
                />
              }
            />
            <Bar dataKey="requests" radius={[10, 10, 0, 0]} fill="url(#providerGradient)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const BudgetOverview: FC<{ allowed: boolean; budget: number; spent: number; remaining: number; usagePercent: number }> = ({
  allowed,
  budget,
  spent,
  remaining,
  usagePercent,
}) => {
  const status = getBudgetStatus(usagePercent);
  const clamped = Math.min(100, Math.max(0, usagePercent));

  return (
    <Card className="overflow-hidden rounded-2xl border-border/60 bg-card/80 shadow-[0_1px_0_rgba(255,255,255,0.02),0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur">
      <CardHeader className="px-4 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <span className={`rounded-full p-2 ${status.iconTone} ring-1 ring-current/20`}>
                <ShieldAlert className="h-4 w-4" />
              </span>
              Budget Governance
            </CardTitle>
            <CardDescription>Real-time budget pressure, remaining allowance, and policy status.</CardDescription>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                <div className="text-xs text-muted-foreground">Remaining</div>
                <div className={`mt-1 text-lg font-semibold ${status.accent}`}>{formatCurrency(remaining)}</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                <div className="text-xs text-muted-foreground">Spent</div>
                <div className="mt-1 text-lg font-semibold">{formatCurrency(spent)}</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                <div className="text-xs text-muted-foreground">Daily budget</div>
                <div className="mt-1 text-lg font-semibold">{formatCurrency(budget)}</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                <div className="text-xs text-muted-foreground">Policy</div>
                <div className={`mt-1 text-lg font-semibold ${allowed ? "text-emerald-500" : "text-red-500"}`}>{allowed ? "Open" : "Paused"}</div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Budget utilization</span>
                <span className="font-medium tabular-nums">{usagePercent.toFixed(1)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted/70">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${status.gradient}`}
                  style={{ width: `${clamped}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Governance signal</div>
                <div className={`mt-2 text-3xl font-semibold tracking-tight ${status.accent}`}>{usagePercent.toFixed(0)}%</div>
              </div>
              <div className="relative flex h-24 w-24 items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(${status.ringColor} ${clamped}%, rgba(148,163,184,0.14) 0)`,
                  }}
                />
                <div className="absolute inset-[10px] rounded-full border border-border/60 bg-background/95 backdrop-blur" />
                <div className="relative z-10 text-center">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Usage</div>
                  <div className="text-lg font-semibold tabular-nums">{usagePercent.toFixed(0)}%</div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {allowed ? "Requests are within policy and budget thresholds." : "Traffic is paused until usage returns within governance thresholds."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline">{status.label}</Badge>
              <Badge variant="outline">Budget-aware</Badge>
              <Badge variant="outline">Real-time enforcement</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ProviderAnalytics: FC<{ providers: GatewayProviderSummary[] }> = ({ providers }) => {
  const maxRequests = Math.max(...providers.map((provider) => provider.requests), 1);

  return (
    <Card className="overflow-hidden rounded-2xl border-border/60 bg-card/80 shadow-[0_1px_0_rgba(255,255,255,0.02),0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur">
      <CardHeader className="px-4 pt-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <span className="rounded-full bg-violet-500/10 p-2 text-violet-600 ring-1 ring-violet-500/20">
            <Server className="h-4 w-4" />
          </span>
          Provider Analytics
        </CardTitle>
        <CardDescription>Operational view of provider mix, latency, and spend concentration.</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="overflow-hidden rounded-xl border border-border/60 bg-background/40">
          <div className="grid grid-cols-[1.2fr_0.7fr_0.9fr_0.8fr] gap-3 border-b border-border/60 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span>Provider</span>
            <span>Requests</span>
            <span>Latency</span>
            <span>Spend</span>
          </div>
          <div className="divide-y divide-border/60">
            {providers.length === 0 ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">No provider telemetry available yet.</div>
            ) : (
              providers.map((provider, index) => (
                <div
                  key={provider.provider}
                  className="grid grid-cols-1 gap-3 px-4 py-4 transition-colors hover:bg-muted/40 md:grid-cols-[1.2fr_0.7fr_0.9fr_0.8fr] md:items-center"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {provider.provider}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">{provider.requests.toLocaleString()} requests</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted/70">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${index % 2 === 0 ? "from-violet-500 to-blue-500" : "from-emerald-500 to-cyan-500"}`}
                        style={{ width: `${(provider.requests / maxRequests) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">{provider.requestShare.toFixed(2)}% of traffic</div>
                  </div>

                  <div className="flex items-center gap-2 md:justify-start">
                    <span className="text-sm font-semibold tabular-nums">{provider.totalTokens.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">tokens</span>
                  </div>

                  <div>
                    <Badge variant="outline" className="tabular-nums">
                      {formatLatency(provider.averageLatency)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 md:justify-between">
                    <span className="text-sm font-semibold tabular-nums">{formatCurrency(provider.estimatedSpend)}</span>
                    <span className="text-xs text-muted-foreground">share {provider.requestShare.toFixed(1)}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RecentRequestsTable: FC<{ requests: HonoRequestLog[] }> = ({ requests }) => {
  return (
    <Card className="overflow-hidden rounded-2xl border-border/60 bg-card/80 shadow-[0_1px_0_rgba(255,255,255,0.02),0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur">
      <CardHeader className="px-4 pt-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <span className="rounded-full bg-cyan-500/10 p-2 text-cyan-600 ring-1 ring-cyan-500/20">
            <Clock className="h-4 w-4" />
          </span>
          Recent Requests
        </CardTitle>
        <CardDescription>Latest request log entries with operational detail for quick triage.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[420px]">
          <div className="border-t border-border/60">
            <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.7fr] gap-3 border-b border-border/60 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <span>Request</span>
              <span>Latency</span>
              <span>Spend</span>
              <span>Queue</span>
              <span>Time</span>
            </div>
            <div className="divide-y divide-border/60">
              {requests.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">No request logs yet...</p>
              ) : (
                requests.map((request) => (
                  <div key={request.id} className="grid gap-3 px-4 py-4 transition-colors hover:bg-muted/40 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.7fr] md:items-center">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {request.provider}
                        </Badge>
                        <Badge variant="secondary" className="font-medium text-foreground">
                          {request.model}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{request.totalTokens.toLocaleString()} tokens processed</div>
                    </div>

                    <div>
                      <Badge variant="outline" className="tabular-nums">
                        {formatLatency(request.latency)}
                      </Badge>
                    </div>

                    <div className="text-sm font-semibold tabular-nums">{formatCurrency(request.estimatedCost ?? 0)}</div>

                    <div className="text-sm text-muted-foreground tabular-nums">{request.queueTime ?? 0} ms</div>

                    <div className="text-sm text-muted-foreground">{formatTimestamp(request.createdAt)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-3 text-sm text-muted-foreground">
        <p>Showing the latest 10 requests from the Hono request log.</p>
      </CardFooter>
    </Card>
  );
};

export const ApiGatewayDashboard: FC = () => {
  const { summary, budget, providers, dailyActivity, recentRequests } = useRealtimeGatewayData();

  const providerChartData: ProviderChartPoint[] = useMemo(
    () => providers.map((provider) => ({ provider: provider.provider, requests: provider.requests })),
    [providers],
  );

  const dailyChartData: SummaryChartPoint[] = useMemo(
    () =>
      dailyActivity.map((day) => ({
        date: day.date,
        requests: day.requests,
        estimatedSpend: day.estimatedSpend,
        tokens: day.tokens,
      })),
    [dailyActivity],
  );

  const requestCountLabel = summary.totalRequests.toLocaleString();
  const tokenCountLabel = summary.totalTokens.toLocaleString();
  const latencyLabel = formatLatency(summary.averageLatency || 0);
  const spendLabel = formatCurrency(summary.estimateCost || 0);
  const budgetStatus = getBudgetStatus(budget.usagePercent);

  return (
    <div className="relative min-h-full w-full overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.10),_transparent_26%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent" />
      <TooltipProvider>
        <div className="relative mx-auto flex max-w-[1600px] flex-col gap-5 px-4 py-5 md:gap-6 md:px-8 lg:px-10">
          <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/75 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-foreground">Sentinal</span>
                  <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1">Live backend telemetry</span>
                  <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1">Governance aware</span>
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                    AI Usage Governance & Observability Platform
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                    Monitor requests, spend, provider mix, latency, and budget enforcement from a single premium control surface.
                  </p>
                </div>
              </div>

              <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[520px]">
                <div className="rounded-2xl border border-border/60 bg-background/50 px-4 py-3 shadow-sm">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Live requests</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight">{requestCountLabel}</div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/50 px-4 py-3 shadow-sm">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Latency</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight">{latencyLabel}</div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/50 px-4 py-3 shadow-sm">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Budget status</div>
                  <div className={`mt-2 text-2xl font-semibold tracking-tight ${budgetStatus.accent}`}>{budgetStatus.label}</div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total Requests"
              value={requestCountLabel}
              icon={<MessageSquareMore className="h-4 w-4" />}
              description="Requests recorded in requestLogs"
              badge={<Badge variant="outline">{providers.length} providers</Badge>}
              accentClassName="from-blue-500/40 via-blue-400/30 to-transparent"
              iconToneClassName="bg-blue-500/10 text-blue-600 ring-blue-500/20"
            />
            <MetricCard
              title="Total Tokens"
              value={tokenCountLabel}
              icon={<Database className="h-4 w-4" />}
              description="Prompt plus completion tokens"
              accentClassName="from-violet-500/40 via-violet-400/30 to-transparent"
              iconToneClassName="bg-violet-500/10 text-violet-600 ring-violet-500/20"
            />
            <MetricCard
              title="Average Latency"
              value={latencyLabel}
              icon={<TimerReset className="h-4 w-4" />}
              description="Average end-to-end latency across all requests"
              accentClassName="from-amber-500/40 via-amber-400/30 to-transparent"
              iconToneClassName="bg-amber-500/10 text-amber-600 ring-amber-500/20"
            />
            <MetricCard
              title="Estimated Spend"
              value={spendLabel}
              icon={<Gauge className="h-4 w-4" />}
              description="Estimated spend from backend telemetry"
              badge={
                <Badge variant={budget.allowed ? "secondary" : "destructive"}>
                  {budget.usagePercent.toFixed(2)}% of daily budget used
                </Badge>
              }
              accentClassName="from-emerald-500/40 via-emerald-400/30 to-transparent"
              iconToneClassName="bg-emerald-500/10 text-emerald-600 ring-emerald-500/20"
            />
          </div>

          <BudgetOverview
            allowed={budget.allowed}
            budget={budget.budget}
            spent={budget.spent}
            remaining={budget.remaining}
            usagePercent={budget.usagePercent}
          />

          <Separator />

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.15fr_0.85fr]">
            <GatewayChart data={dailyChartData} />
            <ProviderChart data={providerChartData} />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.08fr_0.92fr]">
            <ProviderAnalytics providers={providers} />
            <RecentRequestsTable requests={recentRequests} />
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default ApiGatewayDashboard;
