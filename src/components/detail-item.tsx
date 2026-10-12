import type { LucideIcon } from "lucide-react";

/** Labelled value with an icon, for a `<dl>` grid of details. */
export function DetailItem({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 bg-card p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="flex items-center gap-2 text-sm font-semibold">{children}</dd>
      </div>
    </div>
  );
}
