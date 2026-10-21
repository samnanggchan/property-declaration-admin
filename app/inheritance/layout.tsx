import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function InheritanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="print:p-0 print:m-0">
        <SiteHeader />
        <div className="flex flex-1 flex-col print:block print:p-0 print:m-0">
          <div className="@container/main flex flex-1 flex-col gap-2 print:block print:p-0 print:m-0">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 print:block print:p-0 print:m-0 print:gap-0">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
