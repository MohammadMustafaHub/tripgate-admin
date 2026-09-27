import { useState } from "react";
import { Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { register, type RegisterError } from "@/api/auth";
import { FormError, UNKNOWN_ERROR_MESSAGE } from "@/components/form/form-error";
import { PasswordInput } from "@/components/form/password-input";
import { PhoneInput } from "@/components/form/phone-input";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { AuthHeader } from "@/layouts/auth";
import { toApiPhoneNumber } from "@/lib/phone";
import { useUserStore } from "@/stores/user-store";

const MIN_PASSWORD_LENGTH = 8;

const ERROR_MESSAGES: Record<RegisterError, string> = {
  PHONE_ALREADY_REGISTERED: "رقم الهاتف مسجّل مسبقاً. يمكنك تسجيل الدخول بدلاً من ذلك.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

interface FormErrors {
  phone?: string;
  password?: string;
  confirm?: string;
}

export default function RegisterPage() {
  const signIn = useUserStore((state) => state.signIn);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const mutation = useMutation({
    mutationFn: register,
    // The guest guard sends the new user on to phone verification.
    onSuccess: (result) => result.when(signIn, async () => {}),
  });
  const apiError = mutation.data?.when(
    () => null,
    (error) => ERROR_MESSAGES[error],
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const phoneNumber = toApiPhoneNumber(phone);
    const next: FormErrors = {};
    if (!phoneNumber) next.phone = "يرجى إدخال رقم هاتف عراقي صحيح.";
    if (password.length < MIN_PASSWORD_LENGTH)
      next.password = `يجب ألا تقل كلمة المرور عن ${MIN_PASSWORD_LENGTH} أحرف.`;
    if (confirm !== password) next.confirm = "كلمتا المرور غير متطابقتين.";
    setErrors(next);
    if (!phoneNumber || Object.keys(next).length > 0) return;
    mutation.mutate({ phoneNumber, password });
  }

  return (
    <>
      <AuthHeader title="إنشاء حساب" description="أنشئ حسابك لإدارة رحلات مؤسستك." />
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <FormError message={apiError} />
          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone">رقم الهاتف</FieldLabel>
            <PhoneInput id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errors.phone} required />
            <FieldDescription>سيُرسل رمز تحقق إلى هذا الرقم.</FieldDescription>
            <FieldError>{errors.phone}</FieldError>
          </Field>
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">كلمة المرور</FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              required
            />
            <FieldError>{errors.password}</FieldError>
          </Field>
          <Field data-invalid={!!errors.confirm}>
            <FieldLabel htmlFor="confirm">تأكيد كلمة المرور</FieldLabel>
            <PasswordInput
              id="confirm"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-invalid={!!errors.confirm}
              required
            />
            <FieldError>{errors.confirm}</FieldError>
          </Field>
          <Button type="submit" size="lg" disabled={mutation.isPending}>
            {mutation.isPending && <Spinner />}
            إنشاء الحساب
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            لديك حساب بالفعل؟{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </FieldGroup>
      </form>
    </>
  );
}
