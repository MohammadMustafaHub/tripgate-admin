import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createTenant, type CreateTenantError } from "@/api/tenants";
import { FormError, UNKNOWN_ERROR_MESSAGE } from "@/components/form/form-error";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { AuthHeader } from "@/layouts/auth";
import { tenantDomain } from "@/lib/tenant-url";
import { useUserStore } from "@/stores/user-store";

const SUBDOMAIN_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const ERROR_MESSAGES: Record<CreateTenantError, string> = {
  TENANT_CONFLICT: "النطاق الفرعي مستخدم من قبل مؤسسة أخرى، أو أن حسابك مرتبط بمؤسسة بالفعل.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

interface FormErrors {
  name?: string;
  subdomain?: string;
}

export default function CreateTenantPage() {
  const signIn = useUserStore((state) => state.signIn);
  const signOut = useUserStore((state) => state.signOut);
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const mutation = useMutation({
    mutationFn: createTenant,
    // The reissued tokens carry the tenant; the guard redirects to the dashboard.
    onSuccess: (result) => result.when(signIn, async () => {}),
  });
  const apiError = mutation.data?.when(
    () => null,
    (error) => ERROR_MESSAGES[error],
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: FormErrors = {};
    if (!name.trim()) next.name = "يرجى إدخال اسم المؤسسة.";
    else if (name.trim().length > 200) next.name = "يجب ألا يتجاوز الاسم 200 حرف.";
    if (subdomain.length < 3 || subdomain.length > 63)
      next.subdomain = "يجب أن يتراوح طول النطاق الفرعي بين 3 و63 حرفاً.";
    else if (!SUBDOMAIN_PATTERN.test(subdomain))
      next.subdomain = "يُسمح بالأحرف الإنجليزية الصغيرة والأرقام والشرطة (-) بين الكلمات فقط.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    mutation.mutate({ name: name.trim(), subdomain });
  }

  return (
    <>
      <AuthHeader title="إنشاء المؤسسة" description="أدخل بيانات مؤسستك لإعداد مساحة العمل الخاصة بها." />
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <FormError message={apiError} />
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">اسم المؤسسة</FieldLabel>
            <Input
              id="name"
              value={name}
              maxLength={200}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name}
              placeholder="مثال: شركة الرافدين للسفر والسياحة"
              required
            />
            <FieldError>{errors.name}</FieldError>
          </Field>
          <Field data-invalid={!!errors.subdomain}>
            <FieldLabel htmlFor="subdomain">النطاق الفرعي</FieldLabel>
            <InputGroup dir="ltr" className="h-9 bg-card">
              <InputGroupInput
                id="subdomain"
                value={subdomain}
                maxLength={63}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().trim())}
                aria-invalid={!!errors.subdomain}
                placeholder="alrafidain"
                required
              />
              <InputGroupAddon align="inline-end">.{tenantDomain}</InputGroupAddon>
            </InputGroup>
            <FieldDescription>العنوان الذي ستصل من خلاله إلى مساحة عمل مؤسستك.</FieldDescription>
            <FieldError>{errors.subdomain}</FieldError>
          </Field>
          <Button type="submit" size="lg" disabled={mutation.isPending}>
            {mutation.isPending && <Spinner />}
            إنشاء المؤسسة
          </Button>
          <Button type="button" variant="link" className="h-auto text-muted-foreground" onClick={() => void signOut()}>
            تسجيل الخروج
          </Button>
        </FieldGroup>
      </form>
    </>
  );
}
