import { Outlet } from "react-router";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      {/* Flush with the top, bottom and far edge; only the sidebar side keeps its rounded corners. */}
      <SidebarInset className="bg-card md:peer-data-[variant=inset]:my-0 md:peer-data-[variant=inset]:me-0 md:peer-data-[variant=inset]:rounded-e-none">
        <TopBar />
        <div className="flex flex-1 flex-col gap-6 px-4 pb-6 md:px-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
