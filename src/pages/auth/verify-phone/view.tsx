import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';

import {
  sendVerificationCode,
  verifyPhone,
  type SendVerificationCodeError,
  type VerifyPhoneError,
} from '@/api/verification';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/context/auth-context';

const sendErrors: Record<SendVerificationCodeError, string> = {
  ALREADY_CONFIRMED: 'رقم الهاتف مؤكّد بالفعل.',
  SMS_RATE_LIMITED: 'تم إرسال رمز حديثاً. يرجى الانتظار قبل طلب رمز جديد.',
  UNAUTHORIZED: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
  NETWORK: 'تعذّر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
  UNEXPECTED: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
};

const verifyErrors: Record<VerifyPhoneError, string> = {
  INVALID_OR_EXPIRED_CODE: 'الرمز غير صحيح أو انتهت صلاحيته.',
  UNAUTHORIZED: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
  NETWORK: 'تعذّر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
  UNEXPECTED: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
};

const CODE_LENGTH = 6;

export function VerifyPhoneView() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Nothing to do here once the number is confirmed.
  if (user?.phoneNumberConfirmed) {
    return <Navigate to="/" replace />;
  }

  async function handleSendCode() {
    setError(null);
    setPending(true);
    const result = await sendVerificationCode();
    setPending(false);

    result.when(
      () => {
        setCode('');
        setSent(true);
      },
      async (reason) => {
        // The number was confirmed elsewhere — pick that up and move on.
        if (reason === 'ALREADY_CONFIRMED') {
          await refreshUser();
          navigate('/', { replace: true });
          return;
        }
        setError(sendErrors[reason]);
      }
    );
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (code.length !== CODE_LENGTH) {
      setError(`يرجى إدخال الرمز المكوّن من ${CODE_LENGTH} أرقام.`);
      return;
    }

    setPending(true);
    const result = await verifyPhone({ code });

    result.when(
      async () => {
        // The guard lets the dashboard through once /me reports the new flag.
        await refreshUser();
        navigate('/', { replace: true });
      },
      (reason) => {
        setPending(false);
        setError(verifyErrors[reason]);
      }
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold">تأكيد رقم الهاتف</h1>
        <p className="text-sm text-muted-foreground">
          لتفعيل حسابك، أرسل رمز التحقق إلى الرقم{' '}
          <span dir="ltr">{user?.phoneNumber}</span> ثم أدخله أدناه.
        </p>
      </header>

      {sent ? (
        <form onSubmit={handleVerify} className="flex flex-col gap-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="code">رمز التحقق</FieldLabel>
              <InputOTP
                id="code"
                dir="ltr"
                maxLength={CODE_LENGTH}
                value={code}
                onChange={setCode}
                containerClassName="justify-center [direction:ltr]"
              >
                <InputOTPGroup>
                  {Array.from({ length: CODE_LENGTH }, (_, index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </Field>

            {error && <FieldError>{error}</FieldError>}

            <Button type="submit" disabled={pending} className="w-full">
              {pending && <Spinner />}
              تأكيد الرمز
            </Button>

            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={handleSendCode}
              className="w-full"
            >
              إعادة إرسال الرمز
            </Button>
          </FieldGroup>
        </form>
      ) : (
        <FieldGroup>
          {error && <FieldError>{error}</FieldError>}

          <Button
            type="button"
            disabled={pending}
            onClick={handleSendCode}
            className="w-full"
          >
            {pending && <Spinner />}
            إرسال رمز التحقق
          </Button>
        </FieldGroup>
      )}

      <p className="text-center text-sm text-muted-foreground">
        <button
          type="button"
          className="underline underline-offset-4 hover:text-primary"
          onClick={() => void logout()}
        >
          تسجيل الخروج
        </button>
      </p>
    </div>
  );
}

export default VerifyPhoneView;
