"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/records": "Records",
  "/lifecycle": "Lifecycle",
  "/analytics": "Analytics",
  "/projects": "Projects",
  "/team": "Team",
};

function getTitle(pathname: string): string {
  // Exact match first
  if (titles[pathname]) return titles[pathname];
  // Check prefix matches for nested routes
  if (pathname.startsWith("/records/")) return "Records";
  if (pathname.startsWith("/team/")) return "Team";
  return "Documents";
}

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">{getTitle(pathname)}</h1>
      </div>
    </header>
  );
}
