import { EarningsInterval } from "@/models/analytics";

export type AnalyticsRange = "month" | "next3" | "year" | "last12";

export const ANALYTICS_RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: "month", label: "هذا الشهر" },
  { value: "next3", label: "الأشهر الثلاثة القادمة" },
  { value: "year", label: "هذه السنة" },
  { value: "last12", label: "آخر 12 شهراً" },
];

export const DEFAULT_ANALYTICS_RANGE: AnalyticsRange = "year";

export interface RangeBounds {
  /** ISO, inclusive. */
  from: string;
  /** ISO, exclusive. */
  to: string;
  interval: EarningsInterval;
}

const startOfMonth = (year: number, month: number) => new Date(year, month, 1);

/**
 * Time frame for a preset, in local time. Every bound sits on a day boundary, so the values
 * (and the query keys built from them) stay the same for the whole day.
 */
export function rangeBounds(range: AnalyticsRange, now = new Date()): RangeBounds {
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = new Date(year, month, now.getDate());

  const bounds = (from: Date, to: Date, interval: EarningsInterval): RangeBounds => ({
    from: from.toISOString(),
    to: to.toISOString(),
    interval,
  });

  switch (range) {
    case "month":
      return bounds(startOfMonth(year, month), startOfMonth(year, month + 1), EarningsInterval.Day);
    case "next3":
      return bounds(today, new Date(year, month + 3, now.getDate()), EarningsInterval.Week);
    case "year":
      return bounds(new Date(year, 0, 1), new Date(year + 1, 0, 1), EarningsInterval.Month);
    case "last12":
      return bounds(startOfMonth(year, month - 11), startOfMonth(year, month + 1), EarningsInterval.Month);
  }
}

/** The browser's IANA time zone, so timeline periods line up with local days. */
export function localTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Baghdad";
}
