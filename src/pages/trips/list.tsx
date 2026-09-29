import { Link, useSearchParams } from "react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CalendarPlusIcon, CalendarRangeIcon, XIcon } from "lucide-react";
import { getTripProgram } from "@/api/trip-programs";
import { listTrips } from "@/api/trips";
import { ListPagination } from "@/components/list-pagination";
import { TripCard, TripCardSkeleton } from "@/components/trips/trip-card";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

const STATUS_FILTERS = [
  { value: "all", label: "الكل" },
  { value: "active", label: "الفعّالة" },
  { value: "inactive", label: "المتوقفة" },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

export default function TripsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const status = (STATUS_FILTERS.find((f) => f.value === searchParams.get("status"))?.value ?? "all") as StatusFilter;
  const programId = searchParams.get("program") ?? undefined;

  const { data: result, isPending, refetch } = useQuery({
    queryKey: ["trips", "list", { page, status, programId }],
    queryFn: () =>
      listTrips({
        page,
        pageSize: PAGE_SIZE,
        tripProgramId: programId,
        isActive: status === "all" ? undefined : status === "active",
      }),
    placeholderData: keepPreviousData,
  });

  // Name for the program filter chip.
  const programQuery = useQuery({
    queryKey: ["trip-programs", "detail", programId],
    queryFn: () => getTripProgram({ id: programId! }),
    enabled: !!programId,
  });
  const programName = programQuery.data?.ok ? programQuery.data.value.name : null;

  /** Updates the given search params and returns to the first page. */
  const updateParams = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    next.delete("page");
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next);
  };

  const goToPage = (next: number) => {
    const params = new URLSearchParams(searchParams);
    if (next === 1) params.delete("page");
    else params.set("page", String(next));
    setSearchParams(params);
    document.querySelector("[data-slot=sidebar-inset]")?.scrollTo({ top: 0 });
  };

  const addButton = (
    <Button
      render={<Link to={programId ? `/trips/new?program=${programId}` : "/trips/new"} />}
      nativeButton={false}
    >
      <CalendarPlusIcon />
      جدولة رحلة
    </Button>
  );

  if (result && !result.ok) {
    return (
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyTitle>تعذّر تحميل الرحلات</EmptyTitle>
          <EmptyDescription>يرجى التحقق من اتصالك ثم إعادة المحاولة.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => void refetch()}>
            إعادة المحاولة
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const trips = result?.value.data ?? [];
  const pagination = result?.value.pagination;
  const filtered = status !== "all" || !!programId;

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {isPending ? (
          <Skeleton className="h-9 w-40" />
        ) : (
          <p className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums">{formatNumber(pagination?.totalItems ?? 0)}</span>
            <span className="text-sm text-muted-foreground">
              {filtered ? "رحلة مطابقة" : "إجمالي الرحلات المجدولة"}
            </span>
          </p>
        )}
        {addButton}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="حالة الرحلة" className="inline-flex rounded-lg bg-muted p-1">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={status === filter.value}
              onClick={() => updateParams({ status: filter.value === "all" ? null : filter.value })}
              className={cn(
                "h-7 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                status === filter.value && "bg-card text-foreground shadow-sm",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        {programId && (
          <span className="inline-flex h-8 items-center gap-1.5 rounded-full border bg-card ps-3 pe-1 text-sm">
            <span className="text-muted-foreground">البرنامج:</span>
            {programName ?? <Skeleton className="h-4 w-20" />}
            <button
              type="button"
              aria-label="إزالة تصفية البرنامج"
              onClick={() => updateParams({ program: null })}
              className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <XIcon className="size-3.5" />
            </button>
          </span>
        )}
      </div>

      {isPending ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <TripCardSkeleton key={i} />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <Empty className="flex-1 border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarRangeIcon />
            </EmptyMedia>
            <EmptyTitle>{filtered ? "لا توجد رحلات مطابقة" : "لا توجد رحلات مجدولة بعد"}</EmptyTitle>
            <EmptyDescription>
              {filtered
                ? "جرّب تغيير عوامل التصفية لعرض رحلات أخرى."
                : "جدول رحلة من أحد برامجك لتصبح متاحة للحجز من قِبل عملائك."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>{filtered ? null : addButton}</EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}

      <ListPagination page={page} pagination={pagination} onPageChange={goToPage} />
    </div>
  );
}
