import * as React from "react";
import { cn } from "@/lib/utils";

interface A4PageProps extends React.ComponentProps<"section"> {
  mode?: "flow" | "fixed";
  tone?: "white" | "green";
  padding?: string;
}

export function A4Page({
  mode = "flow",
  tone = "white",
  padding,
  className,
  style,
  ...props
}: A4PageProps) {
  return (
    <section
      data-mode={mode}
      data-tone={tone}
      className={cn("a4-sheet", className)}
      style={
        padding
          ? ({ "--sheet-pad": padding, ...style } as React.CSSProperties)
          : style
      }
      {...props}
    />
  );
}
