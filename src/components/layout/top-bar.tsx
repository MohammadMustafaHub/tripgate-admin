import { Fragment } from "react";
import { useLocation } from "react-router";
import { ChevronLeftIcon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { findNavTrail } from "@/layouts/navigation";
import { AppMenu } from "./app-menu";
import { NotificationsMenu } from "./notifications-menu";

export function TopBar() {
  const { pathname } = useLocation();
  const trail = findNavTrail(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-4 md:px-6">
      <SidebarTrigger className="-ms-1 text-muted-foreground" />
      <Separator orientation="vertical" className="me-1 data-vertical:h-4 data-vertical:self-center" />

      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap">
          {trail.map((title, index) => (
            <Fragment key={title}>
              {index > 0 && (
                <BreadcrumbSeparator>
                  <ChevronLeftIcon />
                </BreadcrumbSeparator>
              )}
              <BreadcrumbItem>
                {index === trail.length - 1 ? (
                  <BreadcrumbPage className="font-medium">{title}</BreadcrumbPage>
                ) : (
                  <span>{title}</span>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ms-auto flex items-center gap-1">
        <NotificationsMenu />
        <AppMenu />
      </div>
    </header>
  );
}
