import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  CircleCheckIcon,
  CirclePauseIcon,
  FlagIcon,
  HourglassIcon,
  PlaneTakeoffIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import { getEarnings, getEarningsTimeline, getTopPrograms, getTripCounts } from "@/api/analytics";
import { ChartPanel } from "@/components/analytics/chart-panel";
import { EarningsTimelineChart, EarningsTimelineTable } from "@/components/analytics/earnings-timeline-chart";
import { TopProgramsChart, TopProgramsTable } from "@/components/analytics/top-programs-chart";
import { SegmentedTabs } from "@/components/segmented-tabs";
import { Stat, StatBand } from "@/components/stat-band";
import {
  ANALYTICS_RANGES,
  DEFAULT_ANALYTICS_RANGE,
  localTimeZone,
  rangeBounds,
  type AnalyticsRange,
} from "@/lib/analytics-range";
import { formatCompactPrice, formatDate, formatNumber, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const TOP_PROGRAMS_LIMIT = 8;

export default function AnalyticsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const range = (ANALYTICS_RANGES.find((r) => r.value === searchParams.get("range"))?.value ??
    DEFAULT_ANALYTICS_RANGE) as AnalyticsRange;
  const bounds = useMemo(() => rangeBounds(range), [range]);
  const timeZone = useMemo(() => localTimeZone(), []);

  const countsQuery = useQuery({ queryKey: ["analytics", "trips"], queryFn: getTripCounts });
  const counts = countsQuery.data?.ok ? countsQuery.data.value : null;

  const earningsQuery = useQuery({
    queryKey: ["analytics", "earnings", bounds.from, bounds.to],
    queryFn: () => getEarnings({ from: bounds.from, to: bounds.to }),
    placeholderData: keepPreviousData,
  });
  const earnings = earningsQuery.data?.ok ? earningsQuery.data.value : null;

  const timelineQuery = useQuery({
    queryKey: ["analytics", "timeline", bounds, timeZone],
    queryFn: () => getEarningsTimeline({ ...bounds, timeZone }),
    placeholderData: keepPreviousData,
  });
  const periods = timelineQuery.data?.ok ? timelineQuery.data.value : [];

  const programsQuery = useQuery({
    queryKey: ["analytics", "top-programs", bounds.from, bounds.to],
    queryFn: () => getTopPrograms({ from: bounds.from, to: bounds.to, limit: TOP_PROGRAMS_LIMIT }),
    placeholderData: keepPreviousData,
  });
  const programs = programsQuery.data?.ok ? programsQuery.data.value : [];

  // `to` is exclusive, so show the day before it as the last day of the range.
  const lastDay = new Date(new Date(bounds.to).getTime() - 1);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <SectionHeading title="الرحلات" description="الحالة الحالية لجميع الرحلات." />
        <StatBand className="grid-cols-1 sm:grid-cols-3 md:grid-flow-row">
          <Stat
            icon={PlaneTakeoffIcon}
            label="رحلات فعّالة"
            value={counts && formatNumber(counts.activeTrips)}
            caption="معروضة للحجز ولم تنطلق بعد"
            loading={countsQuery.isPending}
          />
          <Stat
            icon={CirclePauseIcon}
            label="رحلات متوقفة"
            value={counts && formatNumber(counts.stoppedTrips)}
            caption="أُوقف بيعها ولم تنطلق بعد"
            loading={countsQuery.isPending}
          />
          <Stat
            icon={FlagIcon}
            label="رحلات مكتملة"
            value={counts && formatNumber(counts.completedTrips)}
            caption="انطلقت بالفعل"
            loading={countsQuery.isPending}
          />
        </StatBand>
      </section>

      <section className="flex flex-col gap-4">
        {/* One filter row scopes every earnings figure and chart below it. */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionHeading
            title="الأرباح"
            description={`للرحلات المنطلقة من ${formatDate(bounds.from)} إلى ${formatDate(lastDay)}.`}
          />
          <div className="-mx-1 max-w-full overflow-x-auto px-1 pb-1">
            <SegmentedTabs
              label="الفترة"
              options={ANALYTICS_RANGES}
              value={range}
              onChange={(value) =>
                setSearchParams(value === DEFAULT_ANALYTICS_RANGE ? {} : { range: value }, { replace: true })
              }
            />
          </div>
        </div>

        <StatBand
          className={cn(
            "grid-cols-2 md:grid-flow-row xl:grid-cols-4 transition-opacity",
            earningsQuery.isPlaceholderData && "opacity-60",
          )}
        >
          <Stat
            icon={WalletIcon}
            label="المحقق"
            value={earnings && formatCompactPrice(earnings.earned)}
            caption={earnings ? formatPrice(earnings.earned) : undefined}
            loading={earningsQuery.isPending}
          />
          <Stat
            icon={CircleCheckIcon}
            label="مؤكد قادم"
            value={earnings && formatCompactPrice(earnings.upcomingConfirmed)}
            caption={earnings ? formatPrice(earnings.upcomingConfirmed) : undefined}
            loading={earningsQuery.isPending}
          />
          <Stat
            icon={HourglassIcon}
            label="قيد الانتظار"
            value={earnings && formatCompactPrice(earnings.upcomingPending)}
            caption={earnings ? formatPrice(earnings.upcomingPending) : undefined}
            loading={earningsQuery.isPending}
          />
          <Stat
            icon={TrendingUpIcon}
            label="المتوقع"
            value={earnings && formatCompactPrice(earnings.projected)}
            caption={earnings ? formatPrice(earnings.projected) : undefined}
            loading={earningsQuery.isPending}
          />
        </StatBand>
        {earningsQuery.data && !earningsQuery.data.ok && (
          <p className="text-sm text-destructive">تعذّر تحميل ملخص الأرباح.</p>
        )}

        <div className="grid gap-4 xl:grid-cols-5">
          <ChartPanel
            className="xl:col-span-3"
            title="الأرباح عبر الزمن"
            description="المحقق: حجوزات مؤكدة لرحلات انطلقت. المتوقع: المحقق مع حجوزات الرحلات القادمة."
            loading={timelineQuery.isPending}
            refreshing={timelineQuery.isPlaceholderData}
            error={!!timelineQuery.data && !timelineQuery.data.ok}
            empty={periods.length === 0}
            emptyMessage="لا توجد بيانات أرباح في هذه الفترة."
            chart={() => <EarningsTimelineChart periods={periods} interval={bounds.interval} />}
            table={() => <EarningsTimelineTable periods={periods} interval={bounds.interval} />}
          />
          <ChartPanel
            className="xl:col-span-2"
            title="البرامج الأعلى أرباحاً"
            description={`أعلى ${formatNumber(TOP_PROGRAMS_LIMIT)} برامج حسب الأرباح في الفترة المختارة.`}
            loading={programsQuery.isPending}
            refreshing={programsQuery.isPlaceholderData}
            error={!!programsQuery.data && !programsQuery.data.ok}
            empty={programs.length === 0}
            emptyMessage="لا توجد برامج ذات أرباح في هذه الفترة."
            chart={() => <TopProgramsChart programs={programs} />}
            table={() => <TopProgramsTable programs={programs} />}
          />
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
