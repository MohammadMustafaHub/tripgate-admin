import { useState } from "react";
import type { createEmployee } from "@/api/employees";
import { FormError } from "@/components/form/form-error";
import { FormActions, FormSection } from "@/components/form/form-section";
import { PasswordInput } from "@/components/form/password-input";
import { PhoneInput } from "@/components/form/phone-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldTitle } from "@/components/ui/field";
import { ROLE_LABELS, Role } from "@/lib/permissions";
import { toApiPhoneNumber } from "@/lib/phone";
import { scrollToFirstError } from "@/lib/scroll-to-error";

export type EmployeeFormOutput = Parameters<typeof createEmployee>[0];

const MIN_PASSWORD_LENGTH = 8;

/** Roles a tenant admin can grant, in the order they are offered. */
const GRANTABLE_ROLES: { role: Role; description: string }[] = [
  { role: Role.Admin, description: "صلاحيات كاملة على البرامج والرحلات والحجوزات والتحليلات، عدا إدارة الموظفين." },
  { role: Role.TripProgramsManager, description: "إضافة برامج الرحلات وتعديلها وحذفها." },
  { role: Role.TripsManager, description: "جدولة الرحلات وتعديلها وإيقافها وحذفها." },
  { role: Role.BookingsViewer, description: "استعراض الحجوزات دون تعديلها." },
  { role: Role.BookingsManager, description: "استعراض الحجوزات وإضافتها وقبولها وإلغاؤها." },
  { role: Role.StatisticsViewer, description: "استعراض صفحة التحليلات والأرباح." },
];

// Roles whose access already includes others; the included ones are shown ticked and locked.
const IMPLIED_ROLES: Partial<Record<Role, Role[]>> = {
  [Role.Admin]: GRANTABLE_ROLES.map((r) => r.role).filter((role) => role !== Role.Admin),
  [Role.BookingsManager]: [Role.BookingsViewer],
};

interface FormErrors {
  phone?: string;
  password?: string;
  confirm?: string;
}

export function EmployeeForm({
  submitLabel,
  cancelTo,
  pending,
  error,
  onSubmit,
}: {
  submitLabel: string;
  cancelTo: string;
  pending: boolean;
  error?: string | null;
  onSubmit: (values: EmployeeFormOutput) => void;
}) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const implied = new Set(roles.flatMap((role) => IMPLIED_ROLES[role] ?? []));

  const toggleRole = (role: Role, checked: boolean) =>
    setRoles((current) => (checked ? [...current, role] : current.filter((r) => r !== role)));

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const phoneNumber = toApiPhoneNumber(phone);
    const next: FormErrors = {};
    if (!phoneNumber) next.phone = "يرجى إدخال رقم هاتف عراقي صحيح.";
    if (password.length < MIN_PASSWORD_LENGTH)
      next.password = `يجب ألا تقل كلمة المرور عن ${MIN_PASSWORD_LENGTH} أحرف.`;
    if (confirm !== password) next.confirm = "كلمتا المرور غير متطابقتين.";
    setErrors(next);
    if (Object.keys(next).length > 0 || !phoneNumber) {
      scrollToFirstError();
      return;
    }
    // Roles covered by another selected role add nothing, so only the explicit ones are sent.
    onSubmit({ phoneNumber, password, roles: roles.filter((role) => !implied.has(role)) });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col">
      <FormError message={error} />

      <FormSection title="بيانات الحساب" description="يسجّل الموظف دخوله برقم الهاتف وكلمة المرور، ويمكنه تغييرها لاحقاً.">
        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="phone">رقم الهاتف</FieldLabel>
          <PhoneInput
            id="phone"
            autoComplete="off"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={!!errors.phone}
          />
          <FieldError>{errors.phone}</FieldError>
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">كلمة المرور</FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
            />
            <FieldDescription>{MIN_PASSWORD_LENGTH} أحرف على الأقل.</FieldDescription>
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
            />
            <FieldError>{errors.confirm}</FieldError>
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="الصلاحيات"
        description="حدّد ما يمكن للموظف فعله. دون أي صلاحية يقتصر وصوله على استعراض البرامج والرحلات."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {GRANTABLE_ROLES.map(({ role, description }) => {
            const isImplied = implied.has(role);
            return (
              <FieldLabel key={role} htmlFor={`role-${role}`}>
                <Field orientation="horizontal" data-disabled={isImplied}>
                  <Checkbox
                    id={`role-${role}`}
                    checked={isImplied || roles.includes(role)}
                    disabled={isImplied}
                    onCheckedChange={(checked) => toggleRole(role, checked)}
                  />
                  <FieldContent>
                    <FieldTitle>{ROLE_LABELS[role]}</FieldTitle>
                    <FieldDescription>{description}</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            );
          })}
        </div>
      </FormSection>

      <FormActions cancelTo={cancelTo} submitLabel={submitLabel} pending={pending} />
    </form>
  );
}
