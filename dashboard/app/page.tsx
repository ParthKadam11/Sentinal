import AppSidebar from "@/components/ui/sidebar-one";
import { SidebarInset, SidebarProvider } from "@/components/blocks/sidebar";

export default function DemoOne() {
  return (
    <div className="min-h-screen">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
            Main content area
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
