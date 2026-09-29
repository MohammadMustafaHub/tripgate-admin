import type { LucideIcon } from "lucide-react";

/** 2×2 grid of square tiles; gap-px over a border-coloured background draws the dividing lines. */
export function StatTiles({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border">{children}</div>;
}

export function StatTile({
  icon: Icon,
  label,
  value,
  caption,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <div className="flex aspect-square flex-col items-center justify-center gap-2 bg-card p-4 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <span className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{value}</span>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      {caption && <span className="-mt-1 text-xs text-muted-foreground/80">{caption}</span>}
    </div>
  );
}
