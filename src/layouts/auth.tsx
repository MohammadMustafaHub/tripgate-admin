import { Outlet } from "react-router";
import { PlaneTakeoffIcon } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="grid min-h-svh bg-card lg:grid-cols-2">
      <div className="flex flex-col gap-6 p-6 md:p-10">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-dark text-white">
            <PlaneTakeoffIcon className="size-5" />
          </div>
          <span className="text-lg font-semibold">تريب غيت</span>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
      </div>
      {/* Image panel: intentionally empty until the artwork is ready. */}
      <div className="hidden border-s bg-muted lg:block" aria-hidden="true" />
    </div>
  );
}

export function AuthHeader({
  title,
  description,
}: {
  title: string;
  description?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-1.5">
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
