import AppSidebar from "@/components/ui/sidebar-one";
import { SidebarInset, SidebarProvider } from "@/components/blocks/sidebar";
import GatewayDashboard from "@/components/ui/gateway-dashboard-client";

export default function DashboardPage() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<GatewayDashboard />
			</SidebarInset>
		</SidebarProvider>
	);
}

