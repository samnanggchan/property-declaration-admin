"use client";

import * as React from "react";
import { CalendarDaysIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  dateStringToKhmerLunar,
  KhmerLunarDate,
  toKhmerDigits,
} from "@/lib/khmer-lunar-calendar";

interface KhmerCalendarInputCardProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  issueLocation?: string;
  includeWeekday?: boolean;
  emptyHelperText?: string;
}

/**
 * KhmerCalendarInputCard
 */
export function KhmerCalendarInputCard({
  label = "ថ្ងៃខែឆ្នាំកំណើត",
  value,
  onChange,
  placeholder = "15.08.1982",
  className,
  inputClassName,
  issueLocation,
  includeWeekday = false,
  emptyHelperText = "សូមបញ្ចូល ថ្ងៃ.ខែ.ឆ្នាំ (ឧ. 15.08.1982)",
}: KhmerCalendarInputCardProps) {
  const [lunar, setLunar] = React.useState<KhmerLunarDate | null>(null);

  React.useEffect(() => {
    if (!value || value.trim().length < 8) {
      setLunar(null);
      return;
    }
    const result = dateStringToKhmerLunar(value);
    setLunar(result);
  }, [value]);

  const lunarText = React.useMemo(() => {
    if (!lunar) return "";
    return `ថ្ងៃ${lunar.weekday.replace(/^ថ្ងៃ/, "")} ${toKhmerDigits(lunar.lunarDay)}${lunar.lunarPhase} ខែ${lunar.lunarMonthName} ឆ្នាំ${lunar.zodiacYear} ${lunar.sakYear} ព.ស. ${toKhmerDigits(lunar.buddhistEra)}`;
  }, [lunar]);

  const subLineText = React.useMemo(() => {
    if (!lunar) return "";
    if (issueLocation) {
      const months = [
        "",
        "មករា",
        "កុម្ភៈ",
        "មីនា",
        "មេសា",
        "ឧសភា",
        "មិថុនា",
        "កក្កដា",
        "សីហា",
        "កញ្ញា",
        "តុលា",
        "វិច្ឆិកា",
        "ធ្នូ",
      ];
      return `ធ្វើនៅ${issueLocation} ថ្ងៃទី${toKhmerDigits(String(lunar.gregorianDay).padStart(2, "0"))} ខែ ${months[lunar.gregorianMonth]} ឆ្នាំ${toKhmerDigits(lunar.gregorianYear)}`;
    }
    return lunar.formattedBen;
  }, [lunar, issueLocation]);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label with icon */}
      <Label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
        <CalendarDaysIcon className="size-3.5 text-neutral-500" />
        <span>{label}</span>
      </Label>

      {/* Pill-shaped Input (matching media_1791100916152.png) */}
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-10 rounded-full border border-neutral-200/90 bg-neutral-100/80 px-4",
            "text-sm font-mono text-neutral-900 tracking-wide",
            "focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background",
            "dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-100",
            "transition-all duration-150 shadow-2xs",
            inputClassName,
          )}
        />
      </div>

      {/* Dynamic Lunar Calendar Card (matching media_1791100916152.png) */}
      <div
        className={cn(
          "min-h-[76px] rounded-xl border border-neutral-200/80 bg-white p-3 shadow-xs",
          "dark:border-neutral-800 dark:bg-neutral-950",
          "transition-all duration-200 flex flex-col justify-center",
        )}
      >
        {lunar ? (
          <div className="space-y-1 animate-in fade-in-50 duration-200">
            <p className="text-xs font-bold leading-relaxed text-neutral-900 dark:text-neutral-100 font-khmer">
              {lunarText}
            </p>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-khmer">
              {subLineText}
            </p>
          </div>
        ) : (
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 italic">
            {emptyHelperText}
          </p>
        )}
      </div>
    </div>
  );
}
