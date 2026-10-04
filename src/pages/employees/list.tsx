import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InboxIcon, Trash2Icon, UserPlusIcon } from "lucide-react";
import { listEmployees, removeEmployee, type RemoveEmployeeError } from "@/api/employees";
import { UNKNOWN_ERROR_MESSAGE } from "@/components/form/form-error";
import { ListPagination } from "@/components/list-pagination";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { usePermission } from "@/hooks/use-permission";
import { formatNumber } from "@/lib/format";
import { Permission, Role, formatRole } from "@/lib/permissions";
import { formatPhoneNumber } from "@/lib/phone";
import type { Employee } from "@/models/employee";
import { useUserStore } from "@/stores/user-store";

const PAGE_SIZE = 20;
const LOADING_ROWS = 3;

const REMOVE_ERRORS: Record<RemoveEmployeeError, string> = {
  INVALID_EMPLOYEE: "تعذّر إزالة هذا الموظف.",
  NOT_FOUND: "لم يعد هذا الموظف موجوداً.",
  IS_TENANT_ADMIN: "لا يمكن إزالة مدير المؤسسة.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

export default function EmployeesListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const currentUserId = useUserStore((state) => state.user?.id);

  const { data: result, isPending } = useQuery({
    queryKey: ["employees", "list", page],
    queryFn: () => listEmployees({ page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });
  const employees = result?.ok ? result.value.data : [];
  // Only the tenant admin manages employees, and the tenant admin's own account cannot be removed.
  const canRemove = usePermission(Permission.ManageEmployees);
  const columnCount = 3 + Number(canRemove);

  const queryClient = useQueryClient();
  const [removing, setRemoving] = useState<Employee | null>(null);
  const remove = useMutation({
    mutationFn: removeEmployee,
    onSuccess: (result) => {
      setRemoving(null);
      if (!result.ok) {
        toast.add({ type: "error", title: REMOVE_ERRORS[result.error] });
        if (result.error === "NOT_FOUND") void queryClient.invalidateQueries({ queryKey: ["employees"] });
        return;
      }
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.add({ type: "success", title: "تمت إزالة الموظف." });
    },
  });
  const pagination = result?.ok ? result.value.pagination : undefined;

  const goToPage = (next: number) => {
    setSearchParams(next === 1 ? {} : { page: String(next) });
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
            <span className="text-sm text-muted-foreground">إجمالي الموظفين</span>
          </p>
        )}
        <Button render={<Link to="/settings/employees/new" />} nativeButton={false}>
          <UserPlusIcon />
          إضافة موظف
        </Button>
      </div>

      {result && !result.ok ? (
        <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          تعذّر تحميل الموظفين. يرجى تحديث الصفحة والمحاولة مجدداً.
        </p>
      ) : (
        <div className="overflow-hidden border">
          <Table>
            <TableHeader className="bg-muted/70">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>رقم الهاتف</TableHead>
                <TableHead>الصلاحيات</TableHead>
                {canRemove && <TableHead className="text-end">الإجراءات</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                Array.from({ length: LOADING_ROWS }, (_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    {Array.from({ length: columnCount }, (_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full max-w-28" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : employees.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columnCount} className="py-12">
                    <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                      <InboxIcon className="size-6" />
                      <span className="text-sm">لا يوجد موظفون بعد.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee, index) => (
                  <TableRow key={employee.id}>
                    <TableCell className="text-center text-muted-foreground tabular-nums">
                      {formatNumber((page - 1) * PAGE_SIZE + index + 1)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span dir="ltr" className="font-medium tabular-nums">
                          {formatPhoneNumber(employee.phoneNumber)}
                        </span>
                        {employee.id === currentUserId && <Badge variant="secondary">أنت</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {employee.roles.length === 0 ? (
                        <span className="text-muted-foreground">استعراض فقط</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {employee.roles.map((role) => (
                            <Badge key={role} variant="outline">
                              {formatRole(role)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    {canRemove && (
                      <TableCell>
                        <div className="flex justify-end">
                          {employee.roles.includes(Role.TenantAdmin) || employee.id === currentUserId ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-none text-destructive hover:text-destructive"
                              disabled={remove.isPending}
                              onClick={() => setRemoving(employee)}
                            >
                              <Trash2Icon />
                              إزالة
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ListPagination page={page} pagination={pagination} onPageChange={goToPage} />

      <AlertDialog open={!!removing} onOpenChange={(open) => !open && !remove.isPending && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>إزالة الموظف؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيُزال حساب{" "}
              <span dir="ltr" className="tabular-nums">
                {removing && formatPhoneNumber(removing.phoneNumber)}
              </span>{" "}
              من النظام ولن يتمكن من تسجيل الدخول بعد ذلك. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>تراجع</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => removing && remove.mutate({ id: removing.id })}
            >
              {remove.isPending && <Spinner />}
              إزالة
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
