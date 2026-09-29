import { Link, useSearchParams } from "react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { MapIcon, PlusIcon } from "lucide-react";
import { listTripPrograms } from "@/api/trip-programs";
import { TripProgramCard, TripProgramCardSkeleton } from "@/components/trip-programs/trip-program-card";
import { ListPagination } from "@/components/list-pagination";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";

const PAGE_SIZE = 12;

export default function TripProgramsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const { data: result, isPending, refetch } = useQuery({
    queryKey: ["trip-programs", "list", page],
    queryFn: () => listTripPrograms({ page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });

  const goToPage = (next: number) => {
    setSearchParams(next === 1 ? {} : { page: String(next) });
    document.querySelector("[data-slot=sidebar-inset]")?.scrollTo({ top: 0 });
  };

  const addButton = (
    <Button render={<Link to="/trip-programs/new" />} nativeButton={false}>
      <PlusIcon />
      إضافة برنامج
    </Button>
  );

  if (result && !result.ok) {
    return (
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyTitle>تعذّر تحميل برامج الرحلات</EmptyTitle>
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

  const programs = result?.value.data ?? [];
  const pagination = result?.value.pagination;

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        {isPending ? (
          <Skeleton className="h-9 w-40" />
        ) : (
          <p className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums">{formatNumber(pagination?.totalItems ?? 0)}</span>
            <span className="text-sm text-muted-foreground">إجمالي برامج الرحلات</span>
          </p>
        )}
        {addButton}
      </div>

      {isPending ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <TripProgramCardSkeleton key={i} />
          ))}
        </div>
      ) : programs.length === 0 ? (
        <Empty className="flex-1 border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MapIcon />
            </EmptyMedia>
            <EmptyTitle>لا توجد برامج رحلات بعد</EmptyTitle>
            <EmptyDescription>أضف أول برنامج رحلة لتتمكن من جدولة الرحلات وعرضها لعملائك.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>{addButton}</EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {programs.map((program) => (
            <TripProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}

      <ListPagination page={page} pagination={pagination} onPageChange={goToPage} />
    </div>
  );
}
