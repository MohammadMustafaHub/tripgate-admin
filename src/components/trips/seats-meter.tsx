import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Reserved-vs-total seats as a label and a bar that turns red when the trip is full. */
export function SeatsMeter({
  reserved,
  total,
  size = "sm",
}: {
  reserved: number;
  total: number;
  size?: "sm" | "lg";
}) {
  const ratio = total > 0 ? Math.min(reserved / total, 1) : 0;
  const full = reserved >= total && total > 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className={cn("flex items-baseline justify-between gap-2", size === "sm" ? "text-xs" : "text-sm")}>
        <span className="text-muted-foreground">
          {full ? "اكتمل الحجز" : `المقاعد المتاحة: ${formatNumber(total - reserved)}`}
        </span>
        <span className="font-medium tabular-nums">
          {formatNumber(reserved)} / {formatNumber(total)}
        </span>
      </div>
      <div
        role="meter"
        aria-label="المقاعد المحجوزة"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={reserved}
        className={cn("overflow-hidden rounded-full bg-muted", size === "sm" ? "h-1.5" : "h-2.5")}
      >
        <div
          className={cn("h-full rounded-full transition-[width]", full ? "bg-destructive" : "bg-primary")}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
