import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

import type { LoginError } from '@/api/auth';
import { PasswordInput } from '@/components/password-input';
import { PhoneInput } from '@/components/phone-input';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/context/auth-context';
import { normalizeIraqiPhone } from '@/lib/phone';

// Exhaustive by construction — a new LoginError will not compile until it has
// a message here.
const errorMessages: Record<LoginError, string> = {
  INVALID_CREDENTIALS: 'رقم الهاتف أو كلمة المرور غير صحيحة.',
  ACCOUNT_LOCKED:
    'تم قفل الحساب بعد محاولات دخول فاشلة متكررة. يرجى المحاولة لاحقاً.',
  NETWORK: 'تعذّر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
  UNEXPECTED: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
};

export function LoginView() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? '/';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // The field takes 7…, 07… or 9647…; the API only takes 9647….
    const normalizedPhone = normalizeIraqiPhone(phoneNumber);
    if (!normalizedPhone) {
      setError('يرجى إدخال رقم هاتف عراقي صحيح، مثل 07XXXXXXXXX.');
      return;
    }

    setPending(true);
    const result = await login({ phoneNumber: normalizedPhone, password });
    setPending(false);

    result.when(
      () => navigate(from, { replace: true }),
      (reason) => setError(errorMessages[reason])
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold">تسجيل الدخول</h1>
        <p className="text-sm text-muted-foreground">
          أدخل رقم هاتفك وكلمة المرور للوصول إلى لوحة التحكم.
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

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">كلمة المرور</FieldLabel>
            <Link
              to="/forgot-password"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              هل نسيت كلمة المرور؟
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>

        {error && <FieldError>{error}</FieldError>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending && <Spinner />}
          تسجيل الدخول
        </Button>
      </FieldGroup>

      <p className="text-center text-sm text-muted-foreground">
        ليس لديك حساب؟{' '}
        <Link
          to="/register"
          className="text-foreground underline underline-offset-4 hover:text-primary"
        >
          أنشئ حساباً جديداً
        </Link>
      </p>
    </form>
  );
}

export default LoginView;
