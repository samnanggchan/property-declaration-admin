import * as React from "react";
import { cn } from "@/lib/utils";

type TColorProp = string | string[];

interface ShineBorderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: TColorProp;
  className?: string;
  children: React.ReactNode;
}

/**
 * @name Shine Border
 * @description An animated background border effect with rotating gradient.
 */
export function ShineBorder({
  borderRadius = 24,
  borderWidth = 1.5,
  duration = 14,
  color = ["#A07CFE", "#FE8FB5", "#FFBE7B"],
  className,
  style,
  children,
  ...props
}: ShineBorderProps) {
  const gradientColors = Array.isArray(color) ? color.join(",") : color;

  return (
    <div
      style={
        {
          "--border-radius": `${borderRadius}px`,
          ...style,
        } as React.CSSProperties
      }
      className={cn(
        "relative min-h-[50px] w-full rounded-[--border-radius] p-3 text-black dark:text-white",
        className,
      )}
      {...props}
    >
      <div
        style={
          {
            "--border-width": `${borderWidth}px`,
            "--border-radius": `${borderRadius}px`,
            "--duration": `${duration}s`,
            "--mask-linear-gradient": `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            "--background-radial-gradient": `radial-gradient(transparent,transparent, ${gradientColors},transparent,transparent)`,
          } as React.CSSProperties
        }
        className={cn(
          "pointer-events-none absolute inset-0 size-full rounded-[--border-radius] p-[--border-width] will-change-[background-position] content-[''] ![-webkit-mask-composite:xor] ![mask-composite:exclude] [background-image:var(--background-radial-gradient)] [background-size:300%_300%] [mask:var(--mask-linear-gradient)] animate-shine",
        )}
      />
      {children}
    </div>
  );
}

export default ShineBorder;
