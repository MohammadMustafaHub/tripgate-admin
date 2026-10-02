import { useState } from "react";
import { ChartColumnIcon, TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { EARNINGS_SERIES, EARNINGS_SERIES_KEYS } from "./series";

/**
 * Bordered section for one chart: title, legend, and a toggle to the same data as a table.
 * While new data loads the previous render stays, dimmed, instead of flashing a skeleton.
 */
export function ChartPanel({
  title,
  description,
  loading,
  refreshing,
  error,
  empty,
  emptyMessage,
  className,
  chart,
  table,
}: {
  title: string;
  description?: string;
  /** First load: nothing to show yet. */
  loading: boolean;
  /** A newer slice is loading while the previous one is shown. */
  refreshing?: boolean;
  error?: boolean;
  empty: boolean;
  emptyMessage: string;
  className?: string;
  chart: () => React.ReactNode;
  table: () => React.ReactNode;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <section className={cn("flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5", className)}>
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="font-semibold">{title}</h3>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <EarningsLegend />
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setView(view === "chart" ? "table" : "chart")}
            disabled={loading || error || empty}
          >
            {view === "chart" ? <TableIcon /> : <ChartColumnIcon />}
            {view === "chart" ? "جدول" : "رسم"}
          </Button>
        </div>
      </header>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <p className="flex h-64 items-center justify-center text-center text-sm text-destructive">
          تعذّر تحميل البيانات. يرجى تحديث الصفحة والمحاولة مجدداً.
        </p>
      ) : empty ? (
        <p className="flex h-64 items-center justify-center text-center text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className={cn("transition-opacity", refreshing && "opacity-60")}>
          {view === "chart" ? chart() : table()}
        </div>
      )}
    </section>
  );
}

/** Swatch-and-label key for the earned / projected series. Text stays in text colours. */
function EarningsLegend() {
  return (
    <ul className="flex items-center gap-3 text-xs text-muted-foreground">
      {EARNINGS_SERIES_KEYS.map((key) => (
        <li key={key} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-2.5 rounded-sm"
            style={{ backgroundColor: `var(--earnings-${key})` }}
          />
          {EARNINGS_SERIES[key].label}
        </li>
      ))}
    </ul>
  );
}
