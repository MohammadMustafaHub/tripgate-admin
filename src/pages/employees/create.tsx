import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEmployee, type CreateEmployeeError } from "@/api/employees";
import { EmployeeForm } from "@/components/employees/employee-form";
import { UNKNOWN_ERROR_MESSAGE } from "@/components/form/form-error";
import { toast } from "@/components/ui/toast";

const ERROR_MESSAGES: Record<CreateEmployeeError, string> = {
  INVALID_EMPLOYEE: "بيانات الموظف غير صالحة. يرجى مراجعة الحقول والمحاولة مجدداً.",
  PHONE_TAKEN: "رقم الهاتف هذا مسجّل مسبقاً بحساب آخر.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

export default function EmployeeCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: (result) => {
      if (!result.ok) return;
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.add({ type: "success", title: "تمت إضافة الموظف بنجاح." });
      navigate("/settings/employees", { replace: true });
    },
  });

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
