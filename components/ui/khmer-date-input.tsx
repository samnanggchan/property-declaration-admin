"use client";

import * as React from "react";
import { CalendarDaysIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { dateStringToKhmerLunar, KhmerLunarDate } from "@/lib/khmer-lunar-calendar";

interface KhmerDateInputProps {
  /** Current value (stored as Gregorian string, e.g. "22.02.1973") */
  value: string;
  onChange: (value: string) => void;
  /** Label text (Khmer). Defaults to "ថ្ងៃ ខែ ឆ្នាំ" */
  label?: string;
  placeholder?: string;
  className?: string;
  /** If true, always show the lunar preview panel */
  alwaysShowPreview?: boolean;
  /** Extra class for the outer wrapper */
  wrapperClassName?: string;
}

/**
 * KhmerDateInput
 *
 * A date input that automatically converts the entered Gregorian date
 * (DD.MM.YYYY / DD/MM/YYYY / DD-MM-YYYY) into a Khmer Lunar Calendar
 * preview shown beneath the field.
 *
 * Matches the UI shown on khmer-lunar-calendar.com
 */
export function KhmerDateInput({
  value,
  onChange,
  label = "ថ្ងៃ ខែ ឆ្នាំ",
  placeholder = "DD.MM.YYYY",
  className,
  alwaysShowPreview = false,
  wrapperClassName,
}: KhmerDateInputProps) {
  const [lunar, setLunar] = React.useState<KhmerLunarDate | null>(null);
  const [focused, setFocused] = React.useState(false);

  // Recompute lunar date whenever value changes
  React.useEffect(() => {
    if (!value || value.trim().length < 8) {
      setLunar(null);
      return;
    }
    const result = dateStringToKhmerLunar(value);
    setLunar(result);
  }, [value]);

  const showPreview = alwaysShowPreview || (lunar !== null && (focused || value.length > 0));

  return (
    <div className={cn("space-y-1", wrapperClassName)}>
      {/* Label */}
      <Label className="text-xs font-medium text-foreground/80 flex items-center gap-1">
        <CalendarDaysIcon className="h-3 w-3 text-muted-foreground" />
        {label}
      </Label>

      {/* Input */}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={cn("h-9 text-xs font-mono tracking-wide", className)}
      />

      {/* Khmer Lunar Calendar preview */}
      {showPreview && lunar && (
        <div
          className={cn(
            "rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-xs",
            "backdrop-blur-sm transition-all duration-200",
            "animate-in fade-in-0 slide-in-from-top-1"
          )}
        >
          {/* Main lunar description: ថ្ងៃ ៨រោច ខែភទ្របទ ឆ្នាំមមី អដ្ឋស័ក ព.ស. ២៥៧០ */}
          <p className="text-foreground/90 font-semibold leading-relaxed font-khmer">
            {lunar.officialLunarLine}
          </p>
          {/* Ben line */}
          <p className="mt-1 text-muted-foreground font-khmer">
            {lunar.formattedBen}
          </p>
        </div>
      )}
    </div>
  );
}
