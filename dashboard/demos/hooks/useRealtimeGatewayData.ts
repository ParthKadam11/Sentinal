"use client";

import { useEffect, useState } from "react";
import type { GatewayDashboardData } from "@/lib/gateway-dashboard";

const emptyGatewayData: GatewayDashboardData = {
  summary: {
    totalRequests: 0,
    totalTokens: 0,
    averageLatency: 0,
    estimateCost: 0,
  },
  budget: {
    budget: 0,
    spent: 0,
    remaining: 0,
    usagePercent: 0,
    allowed: true,
  },
  providers: [],
  dailyActivity: [],
  recentRequests: [],
};

export function useRealtimeGatewayData() {
  const [data, setData] = useState<GatewayDashboardData>(emptyGatewayData);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const response = await fetch("/api/gateway-dashboard", { cache: "no-store" });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const nextData = (await response.json()) as GatewayDashboardData;

        if (isMounted) {
          setData(nextData);
        }
      } catch (error) {
        console.error("Failed to load gateway dashboard data:", error);

        if (isMounted) {
          setData(emptyGatewayData);
        }
      }
    };

    load();
    const intervalId = window.setInterval(load, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return data;
}
