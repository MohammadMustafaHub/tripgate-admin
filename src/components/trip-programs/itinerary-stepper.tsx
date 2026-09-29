import { formatNumber, formatShortDate } from "@/lib/format";
import type { TripStep } from "@/models/trip-program";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Steps with the day range each covers. Horizontal (scrolling when long) on wide screens,
 * vertical on phones. With `startDate` each step also shows its calendar dates.
 */
export function ItineraryStepper({ steps, startDate }: { steps: TripStep[]; startDate?: string }) {
  // Each step starts the day after the previous one ends.
  const ends = steps.reduce<number[]>((acc, step) => [...acc, (acc.at(-1) ?? 0) + Math.max(step.days, 1)], []);
  const start = startDate ? new Date(startDate).getTime() : null;
  const dateOfDay = (day: number) => formatShortDate(new Date(start! + (day - 1) * DAY_MS));

  return (
    <ol className="flex flex-col md:flex-row md:overflow-x-auto md:pb-2">
      {steps.map((step, index) => {
        const from = (ends[index - 1] ?? 0) + 1;
        const to = ends[index];
        const isLast = index === steps.length - 1;
        return (
          <li
            key={step.position}
            className="relative flex gap-4 pb-6 last:pb-0 md:min-w-60 md:flex-1 md:flex-col md:gap-3 md:pe-6 md:pb-0"
          >
            {!isLast && (
              <>
                <span aria-hidden className="absolute start-3.5 top-9 bottom-1 w-px bg-border md:hidden" />
                <span aria-hidden className="absolute start-10 end-1 top-3.5 hidden h-px bg-border md:block" />
              </>
            )}
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-dark text-xs font-semibold text-white">
              {formatNumber(index + 1)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5 md:pt-0">
              <span className="text-xs font-medium text-primary">
                {from === to ? `اليوم ${formatNumber(from)}` : `الأيام ${formatNumber(from)} – ${formatNumber(to)}`}
                {start !== null && (
                  <span className="font-normal text-muted-foreground">
                    {" · "}
                    {from === to ? dateOfDay(from) : `${dateOfDay(from)} – ${dateOfDay(to)}`}
                  </span>
                )}
              </span>
              <p className="text-sm leading-6 whitespace-pre-line">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
