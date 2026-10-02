"use client";

import * as React from "react";
import { CheckIcon, ChevronDownIcon, PaletteIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

type ColorTheme = {
  id: string;
  labelKey: string;
  className: string;
};

const defaultThemes: ColorTheme[] = [
  { id: "default", labelKey: "theme.default", className: "" },
  { id: "blue", labelKey: "theme.blue", className: "theme-blue" },
  { id: "green", labelKey: "theme.green", className: "theme-green" },
  { id: "amber", labelKey: "theme.amber", className: "theme-amber" },
];

const scaledThemes: ColorTheme[] = [
  { id: "scaled-default", labelKey: "theme.default", className: "theme-scaled-default" },
  { id: "scaled-blue", labelKey: "theme.blue", className: "theme-scaled-blue" },
];

const monoThemes: ColorTheme[] = [
  { id: "mono", labelKey: "theme.mono", className: "theme-mono" },
];

const STORAGE_KEY = "color-theme";

export function ThemeSelector() {
  const [activeTheme, setActiveTheme] = React.useState("default");
  const { t } = useI18n();

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setActiveTheme(stored);
      applyThemeClass(stored);
    }
  }, []);

  function getActiveLabel(id: string): string {
    const all = [...defaultThemes, ...scaledThemes, ...monoThemes];
    const theme = all.find((th) => th.id === id);
    return theme ? t(theme.labelKey) : t("theme.default");
  }

  function applyThemeClass(themeId: string) {
    const all = [...defaultThemes, ...scaledThemes, ...monoThemes];
    const html = document.documentElement;

    // Remove all theme classes
    all.forEach((th) => {
      if (th.className) {
        th.className.split(" ").forEach((c) => html.classList.remove(c));
      }
    });

    // Add the new theme class
    const theme = all.find((th) => th.id === themeId);
    if (theme?.className) {
      theme.className.split(" ").forEach((c) => html.classList.add(c));
    }
  }

  function selectTheme(themeId: string) {
    setActiveTheme(themeId);
    localStorage.setItem(STORAGE_KEY, themeId);
    applyThemeClass(themeId);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-1.5 h-8 px-3 text-sm font-medium"
          />
        }
      >
        <PaletteIcon className="size-3.5" />
        <span className="hidden md:inline">{t("common.selectTheme")}</span>
        <span>{getActiveLabel(activeTheme)}</span>
        <ChevronDownIcon className="size-3.5 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("theme.default")}</DropdownMenuLabel>
          {defaultThemes.map((theme) => (
            <DropdownMenuItem
              key={theme.id}
              onClick={() => selectTheme(theme.id)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{t(theme.labelKey)}</span>
              {activeTheme === theme.id && (
                <CheckIcon className="size-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("theme.scaled")}</DropdownMenuLabel>
          {scaledThemes.map((theme) => (
            <DropdownMenuItem
              key={theme.id}
              onClick={() => selectTheme(theme.id)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{t(theme.labelKey)}</span>
              {activeTheme === theme.id && (
                <CheckIcon className="size-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("theme.monospaced")}</DropdownMenuLabel>
          {monoThemes.map((theme) => (
            <DropdownMenuItem
              key={theme.id}
              onClick={() => selectTheme(theme.id)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{t(theme.labelKey)}</span>
              {activeTheme === theme.id && (
                <CheckIcon className="size-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
