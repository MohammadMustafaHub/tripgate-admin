import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCompact, formatPrice } from "@/lib/format";
import { EarningsInterval, type EarningsPeriod } from "@/models/analytics";
import { EARNINGS_SERIES, EARNINGS_SERIES_KEYS } from "./series";

const LOCALE = "ar-IQ-u-nu-latn";

const TICK_FORMATS: Record<EarningsInterval, Intl.DateTimeFormat> = {
  [EarningsInterval.Day]: new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short" }),
  [EarningsInterval.Week]: new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short" }),
  [EarningsInterval.Month]: new Intl.DateTimeFormat(LOCALE, { month: "short" }),
};

const FULL_FORMATS: Record<EarningsInterval, Intl.DateTimeFormat> = {
  [EarningsInterval.Day]: new Intl.DateTimeFormat(LOCALE, { dateStyle: "full" }),
  [EarningsInterval.Week]: new Intl.DateTimeFormat(LOCALE, { dateStyle: "long" }),
  [EarningsInterval.Month]: new Intl.DateTimeFormat(LOCALE, { month: "long", year: "numeric" }),
};

function periodLabel(periodStart: string, interval: EarningsInterval): string {
  const label = FULL_FORMATS[interval].format(new Date(periodStart));
  return interval === EarningsInterval.Week ? `الأسبوع الذي يبدأ ${label}` : label;
}

/** Earned and projected per period as two lines on one axis; time runs right to left. */
export function EarningsTimelineChart({
  periods,
  interval,
}: {
  periods: EarningsPeriod[];
  interval: EarningsInterval;
}) {
  return (
    // SVG text positions are computed left-to-right; the axes are mirrored for RTL instead.
    <div dir="ltr">
      <ChartContainer config={EARNINGS_SERIES} className="aspect-auto h-64 w-full sm:h-72">
        <LineChart data={periods} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="periodStart"
            reversed
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            tickMargin={8}
            minTickGap={24}
            tickFormatter={(value: string) => TICK_FORMATS[interval].format(new Date(value))}
          />
          <YAxis
            orientation="right"
            width={64}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value: number) => formatCompact(value)}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <EarningsTooltip
                  title={periodLabel(String(label), interval)}
                  values={payload.map((item) => ({ key: String(item.dataKey), value: Number(item.value) }))}
                />
              ) : null
            }
          />
          {EARNINGS_SERIES_KEYS.map((key) => (
            <Line
              key={key}
              dataKey={key}
              name={EARNINGS_SERIES[key].label}
              type="monotone"
              stroke={`var(--color-${key})`}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={false}
              activeDot={{ r: 4, fill: `var(--color-${key})`, stroke: "var(--card)", strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  );
}

/** Tooltip body shared by the earnings charts: right-to-left, full amounts, text in text colours. */
export function EarningsTooltip({
  title,
  values,
  footer,
}: {
  title: string;
  values: { key: string; value: number }[];
  footer?: string;
}) {
  return (
    <div dir="rtl" className="min-w-44 rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1.5 font-medium text-foreground">{title}</p>
      <ul className="flex flex-col gap-1">
        {values.map(({ key, value }) => (
          <li key={key} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span aria-hidden className="size-2 rounded-sm" style={{ backgroundColor: `var(--earnings-${key})` }} />
              {EARNINGS_SERIES[key as keyof typeof EARNINGS_SERIES]?.label ?? key}
            </span>
            <span className="font-medium text-foreground tabular-nums">{formatPrice(value)}</span>
          </li>
        ))}
      </ul>
      {footer && <p className="mt-1.5 border-t pt-1.5 text-muted-foreground">{footer}</p>}
    </div>
  );
}

/** The same timeline as a table: one row per period. */
export function EarningsTimelineTable({
  periods,
  interval,
}: {
  periods: EarningsPeriod[];
  interval: EarningsInterval;
}) {
  return (
    <div className="max-h-72 overflow-y-auto border">
      <Table>
        <TableHeader className="sticky top-0 bg-muted">
          <TableRow className="hover:bg-transparent">
            <TableHead>الفترة</TableHead>
            <TableHead className="text-end">{EARNINGS_SERIES.earned.label}</TableHead>
            <TableHead className="text-end">{EARNINGS_SERIES.projected.label}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {periods.map((period) => (
            <TableRow key={period.periodStart}>
              <TableCell>{periodLabel(period.periodStart, interval)}</TableCell>
              <TableCell className="text-end tabular-nums">{formatPrice(period.earned)}</TableCell>
              <TableCell className="text-end tabular-nums">{formatPrice(period.projected)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
