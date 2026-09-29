import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

/** Form section: title and description on one side, its fields on the other. */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-x-10 gap-y-4 border-t py-8 first-of-type:border-t-0 first-of-type:pt-2 lg:grid-cols-[18rem_1fr]">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <FieldGroup className="min-w-0">{children}</FieldGroup>
    </section>
  );
}

/** Cancel and submit buttons pinned to the bottom of the page while the form scrolls. */
export function FormActions({
  cancelTo,
  submitLabel,
  pending,
}: {
  cancelTo: string;
  submitLabel: string;
  pending: boolean;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex justify-end gap-2 border-t bg-card/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
      <Button variant="ghost" render={<Link to={cancelTo} />} nativeButton={false}>
        إلغاء
      </Button>
      <Button type="submit" disabled={pending}>
        {pending && <Spinner />}
        {submitLabel}
      </Button>
    </div>
  );
}
