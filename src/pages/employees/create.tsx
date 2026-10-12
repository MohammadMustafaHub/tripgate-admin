import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEmployee, type CreateEmployeeError } from "@/api/employees";
import { EmployeeForm } from "@/components/employees/employee-form";
import { UNKNOWN_ERROR_MESSAGE } from "@/components/form/form-error";
import { LimitReached } from "@/components/tenant/plan-usage";
import { toast } from "@/components/ui/toast";
import { TENANT_USAGE_KEY, useTenantUsage } from "@/hooks/use-tenant-usage";
import { userLimitMessage } from "@/lib/plan";

const ERROR_MESSAGES: Record<CreateEmployeeError, string> = {
  INVALID_EMPLOYEE: "بيانات الموظف غير صالحة. يرجى مراجعة الحقول والمحاولة مجدداً.",
  PHONE_TAKEN: "رقم الهاتف هذا مسجّل مسبقاً بحساب آخر.",
  LIMIT_REACHED: "بلغت حد خطة الاشتراك لعدد المستخدمين.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

export default function EmployeeCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: usage } = useTenantUsage();

  const mutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: (result) => {
      if (!result.ok) {
        if (result.error === "LIMIT_REACHED") void queryClient.invalidateQueries({ queryKey: TENANT_USAGE_KEY });
        return;
      }
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
      void queryClient.invalidateQueries({ queryKey: TENANT_USAGE_KEY });
      toast.add({ type: "success", title: "تمت إضافة الموظف بنجاح." });
      navigate("/settings/employees", { replace: true });
    },
  });

  // Keep the form up after a failed submit so its error stays visible.
  const limitMessage = usage && !mutation.data ? userLimitMessage(usage) : null;
  if (limitMessage) {
    return <LimitReached message={limitMessage} backTo="/settings/employees" backLabel="العودة إلى الموظفين" />;
  }

  return (
    <EmployeeForm
      submitLabel="إضافة الموظف"
      cancelTo="/settings/employees"
      pending={mutation.isPending}
      error={mutation.data?.when(() => null, (error) => ERROR_MESSAGES[error])}
      onSubmit={(values) => mutation.mutate(values)}
    />
  );
}
