import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border/50 bg-card/80 px-6 py-8 shadow-sm shadow-primary/5 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-card-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}
