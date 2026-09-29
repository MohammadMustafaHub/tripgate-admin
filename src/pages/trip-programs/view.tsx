import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { BusIcon, CalendarDaysIcon, GlobeIcon, MapPinIcon, PencilIcon, UsersIcon, WalletIcon, type LucideIcon } from "lucide-react";
import { getTripProgram } from "@/api/trip-programs";
import { RemoteImage } from "@/components/remote-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { DAY_FORMS, formatNumber, formatPrice, formatTransport, pluralize } from "@/lib/format";
import type { TripProgram, TripStep } from "@/models/trip-program";

export default function TripProgramViewPage() {
  const { id = "" } = useParams();
  const { data: result, isPending, refetch } = useQuery({
    queryKey: ["trip-programs", "detail", id],
    queryFn: () => getTripProgram({ id }),
  });

  if (isPending || !result) return <ViewSkeleton />;

  if (!result.ok) {
    const notFound = result.error === "NOT_FOUND";
    return (
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyTitle>{notFound ? "البرنامج غير موجود" : "تعذّر تحميل البرنامج"}</EmptyTitle>
          <EmptyDescription>
            {notFound ? "ربما حُذف هذا البرنامج أو أن الرابط غير صحيح." : "يرجى التحقق من اتصالك ثم إعادة المحاولة."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          {!notFound && (
            <Button variant="outline" onClick={() => void refetch()}>
              إعادة المحاولة
            </Button>
          )}
          <Button variant={notFound ? "default" : "ghost"} render={<Link to="/trip-programs" />} nativeButton={false}>
            العودة إلى البرامج
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return <ProgramDetails program={result.value} />;
}

function ProgramDetails({ program }: { program: TripProgram }) {
  const steps = [...program.steps].sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="min-w-0 flex-1 text-2xl font-bold">{program.name}</h2>
        <Button variant="outline" render={<Link to={`/trip-programs/${program.id}/edit`} />} nativeButton={false}>
          <PencilIcon />
          تعديل
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="relative">
          <RemoteImage
            src={program.coverImage}
            alt={program.name}
            className="aspect-[4/3] w-full rounded-xl border lg:aspect-auto lg:h-full"
          />
          <Badge className="absolute top-3 start-3 h-7 gap-1.5 bg-black/60 px-3 text-sm text-white backdrop-blur-sm [&>svg]:size-3.5!">
            {program.isInternational ? <GlobeIcon /> : <MapPinIcon />}
            {program.isInternational ? "رحلة دولية" : "رحلة محلية"}
          </Badge>
        </div>
        {/* Square tiles; gap-px over a border-coloured background draws the dividing lines. */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border">
          <StatTile icon={CalendarDaysIcon} label="مدة البرنامج" value={pluralize(program.totalDays, DAY_FORMS)} />
          <StatTile icon={WalletIcon} label="سعر المقعد" value={formatPrice(program.defaultPricePerSeat)} />
          <StatTile icon={UsersIcon} label="عدد المقاعد" value={formatNumber(program.defaultSeats)} />
          <StatTile icon={BusIcon} label="وسيلة النقل" value={formatTransport(program.transportMethod)} />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">عن البرنامج</h3>
        <p className="max-w-4xl text-sm leading-7 whitespace-pre-line text-foreground/85">{program.description}</p>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">مسار الرحلة</h3>
        {steps.length === 0 ? (
          <p className="text-sm text-muted-foreground">لم تُضف مراحل لهذا البرنامج.</p>
        ) : (
          <Stepper steps={steps} />
        )}
      </section>

      {program.images.length > 0 && (
        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">معرض الصور</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {program.images.map((image, index) => (
              <a
                key={image + index}
                href={image}
                target="_blank"
                rel="noopener noreferrer"
                className="overflow-hidden rounded-lg border outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <RemoteImage
                  src={image}
                  alt={`${program.name} - صورة ${formatNumber(index + 1)}`}
                  className="aspect-[4/3] w-full transition-transform duration-300 hover:scale-105"
                />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex aspect-square flex-col items-center justify-center gap-2 bg-card p-4 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <span className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{value}</span>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

/**
 * Steps with the day range each covers. Horizontal (scrolling when long) on wide screens,
 * vertical on phones.
 */
function Stepper({ steps }: { steps: TripStep[] }) {
  // Each step starts the day after the previous one ends.
  const ends = steps.reduce<number[]>((acc, step) => [...acc, (acc.at(-1) ?? 0) + Math.max(step.days, 1)], []);

  return (
    <ol className="flex flex-col md:flex-row md:overflow-x-auto md:pb-2">
      {steps.map((step, index) => {
        const from = (ends[index - 1] ?? 0) + 1;
        const to = ends[index];
        const isLast = index === steps.length - 1;
        return (
          <li
            key={step.position}
            className="relative flex gap-4 pb-6 last:pb-0 md:min-w-60 md:flex-1 md:flex-col md:gap-3 md:pe-6 md:pb-0"
          >
            {!isLast && (
              <>
                <span aria-hidden className="absolute start-3.5 top-9 bottom-1 w-px bg-border md:hidden" />
                <span aria-hidden className="absolute start-10 end-1 top-3.5 hidden h-px bg-border md:block" />
              </>
            )}
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-dark text-xs font-semibold text-white">
              {formatNumber(index + 1)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5 md:pt-0">
              <span className="text-xs font-medium text-primary">
                {from === to ? `اليوم ${formatNumber(from)}` : `الأيام ${formatNumber(from)} – ${formatNumber(to)}`}
              </span>
              <p className="text-sm leading-6 whitespace-pre-line">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ViewSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="aspect-[4/3] w-full rounded-xl lg:aspect-auto lg:h-full" />
        <Skeleton className="aspect-square w-full rounded-xl" />
      </div>
    </div>
  );
}
