import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Full-width band of figures separated by lines; stacks vertically on small screens. */
export function StatBand({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section
      className={cn(
        "grid w-full auto-cols-fr overflow-hidden rounded-xl border divide-y md:grid-flow-col md:divide-x md:divide-y-0",
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
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      {loading ? (
        <Skeleton className="h-11 w-24" />
      ) : (
        <span className="text-4xl font-semibold tracking-tight tabular-nums md:text-5xl">{value ?? "—"}</span>
      )}
      <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </span>
      {caption && <span className="-mt-1.5 text-xs text-muted-foreground/80">{caption}</span>}
    </div>
  );
}
