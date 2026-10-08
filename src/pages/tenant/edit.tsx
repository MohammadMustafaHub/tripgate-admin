import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentTenant, updateTenant, type UpdateTenantError } from "@/api/tenants";
import { UNKNOWN_ERROR_MESSAGE } from "@/components/form/form-error";
import { TenantForm } from "@/components/tenant/tenant-form";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";

const ERROR_MESSAGES: Record<UpdateTenantError, string> = {
  INVALID_TENANT: "تعذّر حفظ البيانات. يرجى التحقق من الاسم والألوان.",
  NOT_FOUND: "لم يُعثر على المؤسسة.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

export default function TenantEditPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: result, isPending, refetch } = useQuery({
    queryKey: ["tenant", "current"],
    queryFn: getCurrentTenant,
  });

  const mutation = useMutation({
    mutationFn: updateTenant,
    onSuccess: (updated) => {
      if (!updated.ok) return;
      void queryClient.invalidateQueries({ queryKey: ["tenant"] });
      toast.add({ type: "success", title: "تم حفظ التعديلات بنجاح." });
      navigate("/settings/tenant", { replace: true });
    },
  });

  if (isPending || !result) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="aspect-[3/2] w-full max-w-sm" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!result.ok) {
    return (
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyTitle>تعذّر تحميل بيانات المؤسسة</EmptyTitle>
          <EmptyDescription>يرجى التحقق من اتصالك ثم إعادة المحاولة.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button variant="outline" onClick={() => void refetch()}>
            إعادة المحاولة
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <TenantForm
      tenant={result.value}
      cancelTo="/settings/tenant"
      pending={mutation.isPending}
      error={mutation.data?.when(() => null, (error) => ERROR_MESSAGES[error])}
      onSubmit={(values) => mutation.mutate(values)}
    />
  );
}
