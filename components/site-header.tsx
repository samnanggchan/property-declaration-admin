"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  SearchIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  CommandIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/components/theme-selector";
import { useI18n } from "@/lib/i18n";

export function SiteHeader() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const { locale, setLocale, t } = useI18n();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  function getTitle(path: string): string {
    if (path === "/dashboard") return t("nav.dashboard");
    if (path === "/declarations" || path.startsWith("/declarations/"))
      return t("nav.declarations");
    if (path === "/lifecycle" || path.startsWith("/lifecycle/"))
      return t("nav.lifecycle");
    if (path === "/analytics") return t("nav.analytics");
    if (path === "/projects") return t("nav.projects");
    if (path === "/team" || path.startsWith("/team/")) return t("nav.team");
    return t("nav.documents");
  }

  return (
    <header
      data-slot="site-header"
      className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        {/* Sidebar trigger + page title */}
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">{getTitle(pathname)}</h1>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative hidden sm:flex items-center">
            <SearchIcon className="absolute left-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("common.search")}
              className="h-8 w-40 lg:w-56 rounded-md border border-input bg-background px-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all"
            />
            <kbd className="absolute right-2 hidden lg:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <CommandIcon className="size-2.5" />K
            </kbd>
          </div>

          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative rounded-full"
            aria-label={t("common.notifications")}
          >
            <BellIcon className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary ring-2 ring-background" />
          </Button>

          {/* Language Switcher (KH / EN) — click to toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full gap-1.5 px-2.5 h-8 font-semibold text-xs"
            onClick={() => setLocale(locale === "km" ? "en" : "km")}
            aria-label={locale === "km" ? "Switch to English" : "ប្ដូរទៅភាសាខ្មែរ"}
          >
            <img
              src={locale === "km" ? "/kh.svg" : "/en.svg"}
              alt={locale === "km" ? "KH" : "EN"}
              className="size-5 rounded-sm object-cover ring-1 ring-border"
            />
            <span className="uppercase tracking-wider">
              {locale === "km" ? "KH" : "EN"}
            </span>
          </Button>

          {/* Theme Toggle (Light/Dark) */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label={t("common.toggleTheme")}
          >
            {mounted && resolvedTheme === "dark" ? (
              <MoonIcon className="size-4" />
            ) : (
              <SunIcon className="size-4" />
            )}
          </Button>

          {/* Color Theme Selector Dropdown */}
          <ThemeSelector />
        </div>
      </div>
    </header>
  );
}
