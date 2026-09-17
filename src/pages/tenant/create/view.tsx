import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';

import { createTenant, type CreateTenantError } from '@/api/tenants';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/context/auth-context';
import { useTenant } from '@/context/tenant-context';
import {
  isValidSubdomain,
  sanitizeSubdomain,
  toSubdomainSlug,
} from '@/lib/subdomain';

const errorMessages: Record<CreateTenantError, string> = {
  ALREADY_HAS_TENANT: 'هذا الحساب مرتبط بمكتب بالفعل.',
  SUBDOMAIN_TAKEN: 'العنوان الفرعي محجوز. يرجى اختيار عنوان آخر.',
  UNAUTHORIZED: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
  NETWORK: 'تعذّر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
  UNEXPECTED: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
};

const MAX_NAME_LENGTH = 100;

const TENANT_DOMAIN = import.meta.env.VITE_TENANT_DOMAIN ?? 'tripgate.com';

export function CreateTenantView() {
  const { tenant, status, setTenant, refreshTenant } = useTenant();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  // Once the field is edited by hand, the name stops driving it.
  const [subdomainEdited, setSubdomainEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (subdomainEdited) return;

    // Only a name that slugifies into a usable label drives the field —
    // anything else leaves whatever is already there alone.
    const slug = toSubdomainSlug(value);
    if (isValidSubdomain(slug)) {
      setSubdomain(slug);
      return;
    }

    // An emptied name has nothing to suggest, so the leftover goes with it.
    if (!value.trim()) setSubdomain('');
  }

  function handleSubdomainChange(value: string) {
    const next = sanitizeSubdomain(value);
    // Clearing the field hands control back to the name.
    setSubdomainEdited(next !== '');
    setSubdomain(next);
  }

  // Nothing to create once a tenant exists.
  if (status === 'present' && tenant) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('يرجى إدخال اسم المكتب.');
      return;
    }

    const normalizedSubdomain = subdomain.trim().toLowerCase();
    if (!isValidSubdomain(normalizedSubdomain)) {
      setError(
        'يجب أن يتكوّن العنوان الفرعي من حروف إنجليزية صغيرة وأرقام وشرطات فقط.'
      );
      return;
    }

    setPending(true);
    const result = await createTenant({
      name: trimmedName,
      subdomain: normalizedSubdomain,
    });

    result.when(
      (value) => {
        setTenant(value);
        navigate('/', { replace: true });
      },
      async (reason) => {
        // Already had one — adopt it instead of reporting a failure.
        if (reason === 'ALREADY_HAS_TENANT') {
          await refreshTenant();
          navigate('/', { replace: true });
          return;
        }
        setPending(false);
        setError(errorMessages[reason]);
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold">إنشاء مكتبك</h1>
        <p className="text-sm text-muted-foreground">
          لم يعد يفصلك عن لوحة التحكم سوى خطوة واحدة. أنشئ مكتبك للمتابعة.
        </p>
      </header>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">اسم المكتب</FieldLabel>
          <Input
            id="name"
            name="name"
            maxLength={MAX_NAME_LENGTH}
            required
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
          />
          <FieldDescription>
            الاسم الذي يظهر لموظفيك وعملائك، ويمكنك تغييره لاحقاً.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="subdomain">العنوان الفرعي</FieldLabel>
          {/* The whole address reads left to right, prefix and suffix included */}
          <InputGroup dir="ltr">
            <InputGroupAddon align="inline-start">
              <InputGroupText>https://</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="subdomain"
              name="subdomain"
              placeholder="acme"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              value={subdomain}
              onChange={(event) => handleSubdomainChange(event.target.value)}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupText>.{TENANT_DOMAIN}</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription>
            عنوان مكتبك على المنصة، ويمكنك تغييره لاحقاً.
          </FieldDescription>
        </Field>

        {error && <FieldError>{error}</FieldError>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending && <Spinner />}
          إنشاء المكتب
        </Button>
      </FieldGroup>

      <p className="text-center text-sm text-muted-foreground">
        <button
          type="button"
          className="underline underline-offset-4 hover:text-primary"
          onClick={() => void logout()}
        >
          تسجيل الخروج
        </button>
      </p>
    </form>
  );
}

export default CreateTenantView;
