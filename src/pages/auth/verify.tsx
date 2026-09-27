import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  sendVerificationCode,
  verifyPhone,
  type SendVerificationCodeError,
  type VerifyPhoneError,
} from "@/api/verification";
import { FormError, UNKNOWN_ERROR_MESSAGE } from "@/components/form/form-error";
import { OTP_LENGTH, OtpInput } from "@/components/form/otp-input";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { AuthHeader } from "@/layouts/auth";
import { formatPhoneNumber } from "@/lib/phone";
import { useUserStore } from "@/stores/user-store";

const SEND_ERROR_MESSAGES: Record<Exclude<SendVerificationCodeError, "ALREADY_CONFIRMED">, string> = {
  TOO_MANY_REQUESTS: "تعذّر إرسال الرمز حالياً. يرجى الانتظار قليلاً قبل طلب رمز جديد.",
  UNKNOWN_ERROR: "تعذّر إرسال رمز التحقق. يرجى المحاولة مرة أخرى.",
};

const VERIFY_ERROR_MESSAGES: Record<VerifyPhoneError, string> = {
  INVALID_CODE: "رمز التحقق غير صحيح أو منتهي الصلاحية.",
  UNKNOWN_ERROR: UNKNOWN_ERROR_MESSAGE,
};

export default function VerifyPage() {
  const user = useUserStore((state) => state.user);
  const load = useUserStore((state) => state.load);
  const signIn = useUserStore((state) => state.signIn);
  const signOut = useUserStore((state) => state.signOut);
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const send = useMutation({
    mutationFn: sendVerificationCode,
    onSuccess: (result) => {
      if (result.ok) {
        if (codeSent) toast.add({ type: "success", title: "تم إرسال رمز تحقق جديد." });
        setCodeSent(true);
        setCode("");
      }
      // Already confirmed: reload so the guard moves the user on.
      else if (result.error === "ALREADY_CONFIRMED") return load();
    },
  });

  const verify = useMutation({
    mutationFn: verifyPhone,
    // The new tokens carry the confirmed state; the guard redirects after reload.
    onSuccess: (result) => result.when(signIn, async () => setCode("")),
  });

  const sendError = send.data?.when(
    () => null,
    (error) => (error === "ALREADY_CONFIRMED" ? null : SEND_ERROR_MESSAGES[error]),
  );
  const verifyError = verify.data?.when(
    () => null,
    (error) => VERIFY_ERROR_MESSAGES[error],
  );

  function submit(value: string) {
    if (value.length === OTP_LENGTH && !verify.isPending) verify.mutate({ code: value });
  }

  const phone = (
    <span dir="ltr" className="font-medium text-foreground">
      {user && formatPhoneNumber(user.phoneNumber)}
    </span>
  );

  const signOutButton = (
    <Button type="button" variant="link" className="h-auto px-0 text-muted-foreground" onClick={() => void signOut()}>
      تسجيل الخروج
    </Button>
  );

  if (!codeSent) {
    return (
      <>
        <AuthHeader
          title="تأكيد رقم الهاتف"
          description={<>لإكمال إنشاء حسابك، سنرسل رمز تحقق مكوّناً من {OTP_LENGTH} أرقام إلى الرقم {phone}</>}
        />
        <FieldGroup>
          <FormError message={sendError} />
          <Button size="lg" disabled={send.isPending} onClick={() => send.mutate()}>
            {send.isPending && <Spinner />}
            إرسال رمز التحقق
          </Button>
          {signOutButton}
        </FieldGroup>
      </>
    );
  }

  return (
    <>
      <AuthHeader
        title="تأكيد رقم الهاتف"
        description={<>أدخل رمز التحقق المكوّن من {OTP_LENGTH} أرقام المرسل إلى الرقم {phone}</>}
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(code);
        }}
      >
        <FieldGroup>
          <FormError message={verifyError ?? sendError} />
          <OtpInput
            value={code}
            onChange={setCode}
            onComplete={submit}
            disabled={verify.isPending}
            invalid={!!verifyError}
          />
          <Button type="submit" size="lg" disabled={verify.isPending || code.length !== OTP_LENGTH}>
            {verify.isPending && <Spinner />}
            تأكيد
          </Button>
          <div className="flex items-center justify-between text-sm">
            <Button
              type="button"
              variant="link"
              className="h-auto px-0"
              disabled={send.isPending}
              onClick={() => send.mutate()}
            >
              {send.isPending && <Spinner />}
              إعادة إرسال الرمز
            </Button>
            {signOutButton}
          </div>
        </FieldGroup>
      </form>
    </>
  );
}
