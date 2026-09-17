import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';

import type { RegisterError } from '@/api/auth';
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
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/context/auth-context';
import { normalizeIraqiPhone } from '@/lib/phone';

const errorMessages: Record<RegisterError, string> = {
  PHONE_ALREADY_REGISTERED: 'رقم الهاتف مسجّل مسبقاً.',
  NETWORK: 'تعذّر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
  UNEXPECTED: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
};

// Mirrors the API contract.
const MIN_PASSWORD_LENGTH = 8;

export function RegisterView() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // The field takes 7…, 07… or 9647…; the API only takes 9647….
    const normalizedPhone = normalizeIraqiPhone(phoneNumber);
    if (!normalizedPhone) {
      setError('يرجى إدخال رقم هاتف عراقي صحيح، مثل 07XXXXXXXXX.');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(
        `يجب ألّا تقل كلمة المرور عن ${MIN_PASSWORD_LENGTH} خانات.`
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }

    setPending(true);
    const result = await register({ phoneNumber: normalizedPhone, password });
    setPending(false);

    result.when(
      () => navigate('/', { replace: true }),
      (reason) => setError(errorMessages[reason])
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold">إنشاء حساب جديد</h1>
        <p className="text-sm text-muted-foreground">
          سجّل برقم هاتفك لإعداد مكتبك السياحي على المنصة.
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
          <FieldDescription>
            سيتم إرسال رمز تحقق إلى هذا الرقم.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="password">كلمة المرور</FieldLabel>
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
          إنشاء الحساب
        </Button>
      </FieldGroup>

      <p className="text-center text-sm text-muted-foreground">
        لديك حساب بالفعل؟{' '}
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

export default RegisterView;
