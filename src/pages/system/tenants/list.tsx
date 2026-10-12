import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeftIcon, InboxIcon, SearchIcon, XIcon } from "lucide-react";
import { listSystemTenants } from "@/api/system-tenants";
import { ListPagination } from "@/components/list-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatNumber } from "@/lib/format";
import { formatPlan } from "@/lib/plan";
import { tenantHost } from "@/lib/tenant-url";

const PAGE_SIZE = 20;
const LOADING_ROWS = 5;
const COLUMN_COUNT = 6;

export default function SystemTenantsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("q") ?? "";
  const [draft, setDraft] = useState(search);

  const { data: result, isPending } = useQuery({
    queryKey: ["system-tenants", "list", { page, search }],
    queryFn: () => listSystemTenants({ page, pageSize: PAGE_SIZE, search }),
    placeholderData: keepPreviousData,
  });
  const tenants = result?.ok ? result.value.data : [];
  const pagination = result?.ok ? result.value.pagination : undefined;

  /** Applies a search and returns to the first page. */
  const applySearch = (value: string) => {
    const trimmed = value.trim();
    setDraft(trimmed);
    setSearchParams(trimmed ? { q: trimmed } : {});
  };

  const goToPage = (next: number) => {
    const params = new URLSearchParams(searchParams);
    if (next === 1) params.delete("page");
    else params.set("page", String(next));
    setSearchParams(params);
    document.querySelector("[data-slot=sidebar-inset]")?.scrollTo({ top: 0 });
  };

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {isPending ? (
          <Skeleton className="h-9 w-40" />
        ) : (
          <p className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums">{formatNumber(pagination?.totalItems ?? 0)}</span>
            <span className="text-sm text-muted-foreground">{search ? "مؤسسة مطابقة" : "إجمالي المؤسسات"}</span>
          </p>
        )}
        <form
          role="search"
          className="w-full sm:w-80"
          onSubmit={(e) => {
            e.preventDefault();
            applySearch(draft);
          }}
        >
          <InputGroup className="h-9 bg-card">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            {/* Not type="search": the browser would add its own clear icon next to ours. */}
            <InputGroupInput
              aria-label="بحث عن مؤسسة"
              placeholder="ابحث بالاسم أو النطاق الفرعي"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            {(draft || search) && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-xs" aria-label="مسح البحث" onClick={() => applySearch("")}>
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
        </form>
      </div>

      {result && !result.ok ? (
        <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          تعذّر تحميل المؤسسات. يرجى تحديث الصفحة والمحاولة مجدداً.
        </p>
      ) : (
        <div className="overflow-hidden border">
          <Table>
            <TableHeader className="bg-muted/70">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>المؤسسة</TableHead>
                <TableHead>الخطة</TableHead>
                <TableHead>ينتهي الاشتراك في</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead className="text-end">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                Array.from({ length: LOADING_ROWS }, (_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    {Array.from({ length: COLUMN_COUNT }, (_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full max-w-28" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : tenants.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={COLUMN_COUNT} className="py-12">
                    <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                      <InboxIcon className="size-6" />
                      <span className="text-sm">{search ? "لا توجد مؤسسات مطابقة للبحث." : "لا توجد مؤسسات بعد."}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tenants.map((tenant, index) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="text-center text-muted-foreground tabular-nums">
                      {formatNumber((page - 1) * PAGE_SIZE + index + 1)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{tenant.name}</span>
                        <span dir="ltr" className="self-start text-xs text-muted-foreground">
                          {tenantHost(tenant.subdomain)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {formatPlan(tenant.plan)}
                        <Badge variant={tenant.hasActiveSubscription ? "secondary" : "destructive"}>
                          {tenant.hasActiveSubscription ? "فعّال" : "منتهٍ"}
                        </Badge>
                        {tenant.limitOverrides && <Badge variant="outline">حدود مخصصة</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>{tenant.subscriptionExpiresAt ? formatDate(tenant.subscriptionExpiresAt) : "—"}</TableCell>
                    <TableCell>{formatDate(tenant.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-none"
                          render={<Link to={`/tenants/${tenant.id}`} />}
                          nativeButton={false}
                        >
                          إدارة
                          <ChevronLeftIcon />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ListPagination page={page} pagination={pagination} onPageChange={goToPage} />
    </div>
  );
}
