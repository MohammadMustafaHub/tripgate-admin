import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Full-width band of figures separated by lines. gap-px over a border-coloured background
 * draws the lines, so the band can wrap into any grid; by default it is one row from md up.
 */
export function StatBand({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section
      className={cn(
        "grid w-full gap-px overflow-hidden rounded-xl border bg-border md:auto-cols-fr md:grid-flow-col",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Stat({
  icon: Icon,
  label,
  value,
  caption,
  loading,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
  caption?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 bg-card px-4 py-8 text-center sm:px-6 sm:py-10">
      {loading ? (
        <Skeleton className="h-11 w-24" />
      ) : (
        <span className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">{value ?? "—"}</span>
      )}
      <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </span>
      {caption && <span className="-mt-1.5 text-xs text-muted-foreground/80">{caption}</span>}
    </div>
  );
}
