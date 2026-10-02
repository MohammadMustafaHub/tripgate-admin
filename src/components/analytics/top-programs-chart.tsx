import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SEAT_FORMS, formatCompact, formatNumber, formatPrice, pluralize } from "@/lib/format";
import type { ProgramEarnings } from "@/models/analytics";
import { EarningsTooltip } from "./earnings-timeline-chart";
import { EARNINGS_SERIES, EARNINGS_SERIES_KEYS } from "./series";

const ROW_HEIGHT = 44;
const AXIS_HEIGHT = 32;
const NAME_MAX = 18;

const truncate = (name: string) => (name.length > NAME_MAX ? `${name.slice(0, NAME_MAX - 1)}…` : name);

/**
 * Programs ranked by earnings: horizontal grouped bars (earned, projected), names on the
 * right, bars growing leftward for RTL. Height follows the number of programs.
 */
export function TopProgramsChart({ programs }: { programs: ProgramEarnings[] }) {
  return (
    // SVG text positions are computed left-to-right; the axes are mirrored for RTL instead.
    <div dir="ltr">
      <ChartContainer
        config={EARNINGS_SERIES}
        className="aspect-auto w-full"
        style={{ height: programs.length * ROW_HEIGHT + AXIS_HEIGHT }}
      >
        <BarChart data={programs} layout="vertical" barGap={2} margin={{ top: 0, right: 4, bottom: 0, left: 4 }}>
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis
            type="number"
            reversed
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            minTickGap={16}
            tickFormatter={(value: number) => formatCompact(value)}
          />
          <YAxis
            type="category"
            dataKey="name"
            orientation="right"
            width={128}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            tickMargin={8}
            tickFormatter={truncate}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            content={({ active, payload }) => {
              const program = payload?.[0]?.payload as ProgramEarnings | undefined;
              return active && program ? (
                <EarningsTooltip
                  title={program.name}
                  values={EARNINGS_SERIES_KEYS.map((key) => ({ key, value: program[key] }))}
                  footer={`المقاعد المحجوزة: ${formatNumber(program.bookedSeats)}`}
                />
              ) : null;
            }}
          />
          {EARNINGS_SERIES_KEYS.map((key) => (
            <Bar
              key={key}
              dataKey={key}
              name={EARNINGS_SERIES[key].label}
              fill={`var(--color-${key})`}
              barSize={12}
              // Rounded only at the data end, which is the left side since the axis is reversed.
              radius={[4, 0, 0, 4]}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
}

/** The same ranking as a table. */
export function TopProgramsTable({ programs }: { programs: ProgramEarnings[] }) {
  return (
    <div className="overflow-x-auto border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10 text-center">#</TableHead>
            <TableHead>البرنامج</TableHead>
            <TableHead className="text-end">{EARNINGS_SERIES.earned.label}</TableHead>
            <TableHead className="text-end">{EARNINGS_SERIES.projected.label}</TableHead>
            <TableHead className="text-end">المقاعد المحجوزة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programs.map((program, index) => (
            <TableRow key={program.tripProgramId}>
              <TableCell className="text-center text-muted-foreground tabular-nums">{formatNumber(index + 1)}</TableCell>
              <TableCell className="font-medium">{program.name}</TableCell>
              <TableCell className="text-end tabular-nums">{formatPrice(program.earned)}</TableCell>
              <TableCell className="text-end tabular-nums">{formatPrice(program.projected)}</TableCell>
              <TableCell className="text-end">{pluralize(program.bookedSeats, SEAT_FORMS)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
