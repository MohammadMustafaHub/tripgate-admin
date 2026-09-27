import { useState } from "react";
import { Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { login, type LoginError } from "@/api/auth";
import { FormError, UNKNOWN_ERROR_MESSAGE } from "@/components/form/form-error";
import { PasswordInput } from "@/components/form/password-input";
import { PhoneInput } from "@/components/form/phone-input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { AuthHeader } from "@/layouts/auth";
import { toApiPhoneNumber } from "@/lib/phone";
import { useUserStore } from "@/stores/user-store";

const ERROR_MESSAGES: Record<LoginError, string> = {
  INVALID_CREDENTIALS: "رقم الهاتف أو كلمة المرور غير صحيحة.",
  ACCOUNT_LOCKED: "تم قفل الحساب مؤقتاً بسبب تكرار محاولات الدخول الفاشلة. يرجى المحاولة لاحقاً.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

export default function LoginPage() {
  const signIn = useUserStore((state) => state.signIn);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: login,
    // The guest guard redirects once the user is loaded.
    onSuccess: (result) => result.when(signIn, async () => {}),
  });
  const apiError = mutation.data?.when(
    () => null,
    (error) => ERROR_MESSAGES[error],
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const phoneNumber = toApiPhoneNumber(phone);
    setPhoneError(phoneNumber ? null : "يرجى إدخال رقم هاتف عراقي صحيح.");
    if (!phoneNumber || !password) return;
    mutation.mutate({ phoneNumber, password });
  }

  return (
    <>
      <AuthHeader title="تسجيل الدخول" description="أدخل رقم هاتفك وكلمة المرور للوصول إلى لوحة الإدارة." />
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <FormError message={apiError} />
          <Field data-invalid={!!phoneError}>
            <FieldLabel htmlFor="phone">رقم الهاتف</FieldLabel>
            <PhoneInput id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!phoneError} required />
            <FieldError>{phoneError}</FieldError>
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">كلمة المرور</FieldLabel>
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </div>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <Button type="submit" size="lg" disabled={mutation.isPending}>
            {mutation.isPending && <Spinner />}
            تسجيل الدخول
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              إنشاء حساب جديد
            </Link>
          </p>
        </FieldGroup>
      </form>
    </>
  );
}
