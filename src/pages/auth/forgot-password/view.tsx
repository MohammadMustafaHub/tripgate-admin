import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';

import {
  forgotPassword,
  resetPassword,
  verifyPasswordCode,
  type ForgotPasswordError,
  type ResetPasswordError,
  type VerifyPasswordCodeError,
} from '@/api/password';
import { PasswordInput } from '@/components/password-input';
import { PhoneInput } from '@/components/phone-input';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
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
import { normalizeIraqiPhone } from '@/lib/phone';

const requestErrors: Record<ForgotPasswordError, string> = {
  SMS_RATE_LIMITED: 'تم إرسال رمز حديثاً. يرجى الانتظار قبل طلب رمز جديد.',
  NETWORK: 'تعذّر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
  UNEXPECTED: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
};

const verifyErrors: Record<VerifyPasswordCodeError, string> = {
  INVALID_OR_EXPIRED_CODE: 'الرمز غير صحيح أو انتهت صلاحيته.',
  NETWORK: 'تعذّر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
  UNEXPECTED: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
};

const resetErrors: Record<ResetPasswordError, string> = {
  REJECTED: 'انتهت صلاحية رمز التحقق أو أن كلمة المرور الجديدة غير مقبولة.',
  NETWORK: 'تعذّر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
  UNEXPECTED: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
};

const CODE_LENGTH = 6;
const MIN_PASSWORD_LENGTH = 8;

/** phone → code → password → done */
type Step = 'phone' | 'code' | 'password' | 'done';

export function ForgotPasswordView() {
  const [step, setStep] = useState<Step>('phone');

  const [phoneNumber, setPhoneNumber] = useState('');
  // The normalised number, kept because the later steps have to send it back.
  const [apiPhone, setApiPhone] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function sendCode(target: string) {
    const result = await forgotPassword({ phoneNumber: target });
    return result;
  }

  async function handleRequestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalized = normalizeIraqiPhone(phoneNumber);
    if (!normalized) {
      setError('يرجى إدخال رقم هاتف عراقي صحيح، مثل 07XXXXXXXXX.');
      return;
    }

    setPending(true);
    const result = await sendCode(normalized);
    setPending(false);

    result.when(
      () => {
        setApiPhone(normalized);
        setCode('');
        setStep('code');
      },
      (reason) => setError(requestErrors[reason])
    );
  }

  async function handleResendCode() {
    setError(null);
    setPending(true);
    const result = await sendCode(apiPhone);
    setPending(false);

    result.when(
      () => setCode(''),
      (reason) => setError(requestErrors[reason])
    );
  }

  async function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (code.length !== CODE_LENGTH) {
      setError(`يرجى إدخال الرمز المكوّن من ${CODE_LENGTH} أرقام.`);
      return;
    }

    setPending(true);
    const result = await verifyPasswordCode({ phoneNumber: apiPhone, code });
    setPending(false);

    result.when(
      (value) => {
        setResetToken(value.token);
        setStep('password');
      },
      (reason) => setError(verifyErrors[reason])
    );
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`يجب ألّا تقل كلمة المرور عن ${MIN_PASSWORD_LENGTH} خانات.`);
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }

    setPending(true);
    const result = await resetPassword({
      phoneNumber: apiPhone,
      token: resetToken,
      newPassword: password,
    });
    setPending(false);

    result.when(
      () => setStep('done'),
      (reason) => setError(resetErrors[reason])
    );
  }

  if (step === 'done') {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold">تم تغيير كلمة المرور</h1>
          <p className="text-sm text-muted-foreground">
            يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
          </p>
        </header>

        <Button render={<Link to="/login" />} className="w-full">
          العودة إلى تسجيل الدخول
        </Button>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <form onSubmit={handleVerifyCode} className="flex flex-col gap-6">
        <header className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold">تأكيد رقم الهاتف</h1>
          <p className="text-sm text-muted-foreground">
            أدخل الرمز المكوّن من {CODE_LENGTH} أرقام الذي أُرسل إلى الرقم{' '}
            <span dir="ltr">{apiPhone}</span>.
          </p>
        </header>

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
            onClick={handleResendCode}
            className="w-full"
          >
            إعادة إرسال الرمز
          </Button>
        </FieldGroup>

        <p className="text-center text-sm text-muted-foreground">
          <button
            type="button"
            className="underline underline-offset-4 hover:text-primary"
            onClick={() => {
              setError(null);
              setStep('phone');
            }}
          >
            استخدام رقم آخر
          </button>
        </p>
      </form>
    );
  }

  if (step === 'password') {
    return (
      <form onSubmit={handleResetPassword} className="flex flex-col gap-6">
        <header className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold">كلمة مرور جديدة</h1>
          <p className="text-sm text-muted-foreground">
            اختر كلمة مرور جديدة لحسابك.
          </p>
        </header>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="password">كلمة المرور الجديدة</FieldLabel>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <FieldDescription>
              {MIN_PASSWORD_LENGTH} خانات على الأقل.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="confirmPassword">تأكيد كلمة المرور</FieldLabel>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </Field>

          {error && <FieldError>{error}</FieldError>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending && <Spinner />}
            حفظ كلمة المرور
          </Button>
        </FieldGroup>
      </form>
    );
  }

  return (
    <form onSubmit={handleRequestCode} className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold">استعادة كلمة المرور</h1>
        <p className="text-sm text-muted-foreground">
          أدخل رقم هاتفك وسنرسل إليك رمز تحقق لإعادة تعيين كلمة المرور.
        </p>
      </header>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="phoneNumber">رقم الهاتف</FieldLabel>
          <PhoneInput
            id="phoneNumber"
            name="phoneNumber"
            required
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
          />
        </Field>

        {error && <FieldError>{error}</FieldError>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending && <Spinner />}
          إرسال رمز التحقق
        </Button>
      </FieldGroup>

      <p className="text-center text-sm text-muted-foreground">
        تذكّرت كلمة المرور؟{' '}
        <Link
          to="/login"
          className="text-foreground underline underline-offset-4 hover:text-primary"
        >
          تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}

export default ForgotPasswordView;
