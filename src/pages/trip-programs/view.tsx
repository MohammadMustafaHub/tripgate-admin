import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { BusIcon, CalendarPlusIcon, CalendarRangeIcon, CalendarDaysIcon, GlobeIcon, MapPinIcon, PencilIcon, UsersIcon, WalletIcon } from "lucide-react";
import { getTripProgram } from "@/api/trip-programs";
import { RemoteImage } from "@/components/remote-image";
import { StatTile, StatTiles } from "@/components/stat-tile";
import { ItineraryStepper } from "@/components/trip-programs/itinerary-stepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermission } from "@/hooks/use-permission";
import { imageUrl } from "@/lib/images";
import { DAY_FORMS, formatNumber, formatPrice, formatTransport, pluralize } from "@/lib/format";
import { Permission } from "@/lib/permissions";
import type { TripProgram } from "@/models/trip-program";

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
  const canManage = usePermission(Permission.ManageTripPrograms);
  const canSchedule = usePermission(Permission.ManageTrips);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="min-w-0 flex-1 text-2xl font-bold">{program.name}</h2>
        <Button variant="ghost" render={<Link to={`/trips?program=${program.id}`} />} nativeButton={false}>
          <CalendarRangeIcon />
          الرحلات المجدولة
        </Button>
        {canManage && (
          <Button variant="outline" render={<Link to={`/trip-programs/${program.id}/edit`} />} nativeButton={false}>
            <PencilIcon />
            تعديل
          </Button>
        )}
        {canSchedule && (
          <Button render={<Link to={`/trips/new?program=${program.id}`} />} nativeButton={false}>
            <CalendarPlusIcon />
            جدولة رحلة
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="relative">
          <RemoteImage
            src={imageUrl(program.coverImage)}
            alt={program.name}
            className="aspect-[4/3] w-full rounded-xl border lg:aspect-auto lg:h-full"
          />
          <Badge className="absolute top-3 start-3 h-7 gap-1.5 bg-black/60 px-3 text-sm text-white backdrop-blur-sm [&>svg]:size-3.5!">
            {program.isInternational ? <GlobeIcon /> : <MapPinIcon />}
            {program.isInternational ? "رحلة دولية" : "رحلة محلية"}
          </Badge>
        </div>
        <StatTiles>
          <StatTile icon={CalendarDaysIcon} label="مدة البرنامج" value={pluralize(program.totalDays, DAY_FORMS)} />
          <StatTile icon={WalletIcon} label="سعر المقعد" value={formatPrice(program.defaultPricePerSeat)} />
          <StatTile icon={UsersIcon} label="عدد المقاعد" value={formatNumber(program.defaultSeats)} />
          <StatTile icon={BusIcon} label="وسيلة النقل" value={formatTransport(program.transportMethod)} />
        </StatTiles>
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
          <ItineraryStepper steps={steps} />
        )}
      </section>

      {program.images.length > 0 && (
        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">معرض الصور</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {program.images.map((image, index) => (
              <a
                key={image + index}
                href={imageUrl(image) ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="overflow-hidden rounded-lg border outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <RemoteImage
                  src={imageUrl(image)}
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
