import { CommandIcon } from 'lucide-react';
import { Link, Outlet } from 'react-router';

export function AuthLayout() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Form half — first in the DOM, so in RTL it sits on the right */}
      <div className="flex flex-col p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="flex w-full max-w-sm flex-col gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 self-center font-medium"
            >
              <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <CommandIcon className="size-4" />
              </span>
              TripGate
            </Link>

            <Outlet />
          </div>
        </div>
      </div>

      {/* Image half — placeholder until artwork is supplied */}
      <div className="hidden bg-sidebar p-10 lg:block">
        <div className="flex size-full items-center justify-center rounded-xl border-2 border-dashed border-sidebar-border">
          <span className="text-sm text-sidebar-foreground/60">
            مكان الصورة
          </span>
        </div>
      </div>
    </div>
  );
}
