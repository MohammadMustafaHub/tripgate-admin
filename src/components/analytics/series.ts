import type { ChartConfig } from "@/components/ui/chart";

/**
 * Earned vs projected, the two series every earnings chart shows. Colours live in index.css
 * (--earnings-*, with dark-mode values) so legends outside a chart can use them too; they
 * follow the series, so each keeps its colour in every chart.
 */
export const EARNINGS_SERIES = {
  earned: { label: "المحقق", color: "var(--earnings-earned)" },
  projected: { label: "المتوقع", color: "var(--earnings-projected)" },
} satisfies ChartConfig;

export type EarningsSeriesKey = keyof typeof EARNINGS_SERIES;

export const EARNINGS_SERIES_KEYS: EarningsSeriesKey[] = ["earned", "projected"];
