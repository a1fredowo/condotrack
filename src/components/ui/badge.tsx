import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "default" | "success" | "warning" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneStyles: Record<BadgeTone, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success/10 text-success border border-success/30",
  warning: "bg-warning/10 text-warning border border-warning/30",
  info: "bg-primary/10 text-primary border border-primary/30",
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneStyles[tone],
        className,
      )}
      {...props}
    />
  );
}
