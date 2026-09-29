import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { PaginationData } from "@/api/responses";
import { formatNumber } from "@/lib/format";

/** Page links for paginated lists; renders nothing when everything fits on one page. */
export function ListPagination({
  page,
  pagination,
  onPageChange,
}: {
  page: number;
  pagination: PaginationData | undefined;
  onPageChange: (page: number) => void;
}) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const link = (target: number) => ({
    href: `?page=${target}`,
    onClick: (event: React.MouseEvent) => {
      event.preventDefault();
      onPageChange(target);
    },
  });

  return (
    <Pagination className="mt-2">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text="السابق"
            {...link(page - 1)}
            aria-disabled={!pagination.hasPreviousPage}
            className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
          />
        </PaginationItem>
        {pageWindow(page, pagination.totalPages).map((n, i) =>
          n === null ? (
            <PaginationItem key={`gap-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={n}>
              <PaginationLink {...link(n)} isActive={n === page}>
                {formatNumber(n)}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            text="التالي"
            {...link(page + 1)}
            aria-disabled={!pagination.hasNextPage}
            className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

/** First, last and the pages around the current one; `null` marks a gap. */
function pageWindow(current: number, total: number): (number | null)[] {
  const pages: (number | null)[] = [];
  for (let n = 1; n <= total; n++) {
    if (n === 1 || n === total || Math.abs(n - current) <= 1) pages.push(n);
    else if (pages.at(-1) !== null) pages.push(null);
  }
  return pages;
}
