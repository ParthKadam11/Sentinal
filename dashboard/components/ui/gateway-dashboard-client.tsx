"use client";

import dynamic from "next/dynamic";

const GatewayDashboard = dynamic(
  () => import("@/components/ui/api-gateway-dashboard").then((module) => module.ApiGatewayDashboard),
  { ssr: false },
);

export default GatewayDashboard;
