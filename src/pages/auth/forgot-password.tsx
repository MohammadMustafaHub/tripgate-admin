import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import {
  forgotPassword,
  resetPassword,
  verifyPasswordCode,
  type ForgotPasswordError,
  type ResetPasswordError,
  type VerifyPasswordCodeError,
} from "@/api/password";
import { FormError, UNKNOWN_ERROR_MESSAGE } from "@/components/form/form-error";
import { OTP_LENGTH, OtpInput } from "@/components/form/otp-input";
import { PasswordInput } from "@/components/form/password-input";
import { PhoneInput } from "@/components/form/phone-input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { AuthHeader } from "@/layouts/auth";
import { formatPhoneNumber, toApiPhoneNumber } from "@/lib/phone";

const MIN_PASSWORD_LENGTH = 8;

const FORGOT_ERRORS: Record<ForgotPasswordError, string> = {
  TOO_MANY_REQUESTS: "تعذّر إرسال الرمز حالياً. يرجى الانتظار قليلاً قبل طلب رمز جديد.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

const VERIFY_ERRORS: Record<VerifyPasswordCodeError, string> = {
  INVALID_CODE: "رمز التحقق غير صحيح أو منتهي الصلاحية.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

const RESET_ERRORS: Record<ResetPasswordError, string> = {
  INVALID_TOKEN_OR_PASSWORD: "انتهت صلاحية طلب الاستعادة أو أن كلمة المرور الجديدة غير مقبولة. يرجى المحاولة مجدداً.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

type Step =
  | { name: "phone" }
  | { name: "code"; phoneNumber: string }
  | { name: "password"; phoneNumber: string; token: string };

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>({ name: "phone" });

  return (
    <>
      {step.name === "phone" && (
        <PhoneStep onDone={(phoneNumber) => setStep({ name: "code", phoneNumber })} />
      )}
      {step.name === "code" && (
        <CodeStep
          phoneNumber={step.phoneNumber}
          onDone={(token) => setStep({ name: "password", phoneNumber: step.phoneNumber, token })}
          onBack={() => setStep({ name: "phone" })}
        />
      )}
      {step.name === "password" && <PasswordStep phoneNumber={step.phoneNumber} token={step.token} />}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        تذكرت كلمة المرور؟{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </>
  );
}

function PhoneStep({ onDone }: { onDone: (phoneNumber: string) => void }) {
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (result, { phoneNumber }) => {
      if (result.ok) onDone(phoneNumber);
    },
  });
  const apiError = mutation.data?.when(
    () => null,
    (error) => FORGOT_ERRORS[error],
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const phoneNumber = toApiPhoneNumber(phone);
    setPhoneError(phoneNumber ? null : "يرجى إدخال رقم هاتف عراقي صحيح.");
    if (phoneNumber) mutation.mutate({ phoneNumber });
  }

  return (
    <>
      <AuthHeader title="استعادة كلمة المرور" description="أدخل رقم هاتفك المسجّل وسنرسل إليك رمز تحقق." />
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <FormError message={apiError} />
          <Field data-invalid={!!phoneError}>
            <FieldLabel htmlFor="phone">رقم الهاتف</FieldLabel>
            <PhoneInput id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!phoneError} autoFocus required />
            <FieldError>{phoneError}</FieldError>
          </Field>
          <Button type="submit" size="lg" disabled={mutation.isPending}>
            {mutation.isPending && <Spinner />}
            إرسال الرمز
          </Button>
        </FieldGroup>
      </form>
    </>
  );
}

function CodeStep({
  phoneNumber,
  onDone,
  onBack,
}: {
  phoneNumber: string;
  onDone: (token: string) => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");

  const mutation = useMutation({
    mutationFn: verifyPasswordCode,
    onSuccess: (result) => result.when(({ token }) => onDone(token), () => setCode("")),
  });
  const apiError = mutation.data?.when(
    () => null,
    (error) => VERIFY_ERRORS[error],
  );

  function submit(value: string) {
    if (value.length === OTP_LENGTH && !mutation.isPending) mutation.mutate({ phoneNumber, code: value });
  }

  return (
    <>
      <AuthHeader
        title="أدخل رمز التحقق"
        description={
          <>
            أرسلنا رمزاً مكوّناً من {OTP_LENGTH} أرقام إلى الرقم{" "}
            <span dir="ltr" className="font-medium text-foreground">
              {formatPhoneNumber(phoneNumber)}
            </span>
          </>
        }
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(code);
        }}
      >
        <FieldGroup>
          <FormError message={apiError} />
          <OtpInput value={code} onChange={setCode} onComplete={submit} disabled={mutation.isPending} invalid={!!apiError} />
          <Button type="submit" size="lg" disabled={mutation.isPending || code.length !== OTP_LENGTH}>
            {mutation.isPending && <Spinner />}
            متابعة
          </Button>
          <Button type="button" variant="link" className="h-auto" onClick={onBack}>
            تغيير رقم الهاتف
          </Button>
        </FieldGroup>
      </form>
    </>
  );
}

function PasswordStep({ phoneNumber, token }: { phoneNumber: string; token: string }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (result) => {
      if (!result.ok) return;
      toast.add({ type: "success", title: "تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن." });
      navigate("/login", { replace: true });
    },
  });
  const apiError = mutation.data?.when(
    () => null,
    (error) => RESET_ERRORS[error],
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    if (password.length < MIN_PASSWORD_LENGTH)
      next.password = `يجب ألا تقل كلمة المرور عن ${MIN_PASSWORD_LENGTH} أحرف.`;
    if (confirm !== password) next.confirm = "كلمتا المرور غير متطابقتين.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    mutation.mutate({ phoneNumber, token, newPassword: password });
  }

  return (
    <>
      <AuthHeader title="تعيين كلمة مرور جديدة" description="اختر كلمة مرور جديدة لحسابك." />
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <FormError message={apiError} />
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">كلمة المرور الجديدة</FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              autoFocus
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
            حفظ كلمة المرور
          </Button>
        </FieldGroup>
      </form>
    </>
  );
}
