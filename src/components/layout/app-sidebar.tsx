import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { ChevronLeftIcon, ChevronsUpDownIcon, LogOutIcon, PlaneTakeoffIcon, UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAV_GROUPS, type NavItem } from "@/layouts/navigation";
import { formatPhoneNumber } from "@/lib/phone";
import { useUserStore } from "@/stores/user-store";

// Text-only navigation: no filled background, the active entry is just brighter.
// When collapsed to icons a subtle background keeps the active icon visible.
const NAV_BUTTON_CLASS =
  "h-8 gap-2.5 text-sidebar-foreground/85 hover:bg-transparent hover:text-sidebar-accent-foreground active:bg-transparent data-open:hover:bg-transparent data-active:bg-transparent data-active:font-semibold data-active:text-sidebar-accent-foreground group-data-[collapsible=icon]:hover:bg-sidebar-accent group-data-[collapsible=icon]:data-active:bg-sidebar-accent";

const NAV_SUB_BUTTON_CLASS =
  "h-7 translate-x-0 px-2 text-sidebar-foreground/80 hover:bg-transparent hover:text-sidebar-accent-foreground active:bg-transparent data-active:bg-transparent data-active:font-semibold data-active:text-sidebar-accent-foreground rtl:translate-x-0";

// Tree connectors drawn from the parent icon's centre line: "├─" for each child, "└─" for the last.
const TREE_ITEM_CLASS =
  "ps-4 before:absolute before:inset-y-0 before:start-0 before:w-px before:bg-sidebar-border after:absolute after:start-0 after:top-1/2 after:w-3 after:border-t after:border-sidebar-border last:before:hidden last:after:top-0 last:after:h-1/2 last:after:rounded-es-md last:after:border-s last:after:border-b last:after:border-t-0 has-data-active:after:border-sidebar-foreground/70";

// The sidebar sits on the right, so floating content opens towards the left.
const TOOLTIP_SIDE = "left";

export function AppSidebar() {
  return (
    <Sidebar side="right" variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent active:bg-transparent" render={<Link to="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <PlaneTakeoffIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-start leading-tight">
                <span className="truncate font-semibold text-sidebar-accent-foreground">تريب غيت</span>
                <span className="truncate text-xs text-sidebar-foreground/70">لوحة الإدارة</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label} className="py-1">
            <SidebarGroupLabel className="h-7 text-sidebar-foreground/60">{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) =>
                item.children ? <NavTree key={item.title} item={item} /> : <NavEntry key={item.title} item={item} />,
              )}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function NavEntry({ item }: { item: NavItem }) {
  const { pathname } = useLocation();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={NAV_BUTTON_CLASS}
        isActive={pathname === item.to}
        tooltip={{ children: item.title, side: TOOLTIP_SIDE }}
        render={<NavLink to={item.to!} end />}
      >
        <item.icon />
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function NavTree({ item }: { item: NavItem }) {
  const { pathname } = useLocation();
  const { state, isMobile, setOpen: setSidebarOpen } = useSidebar();
  const containsActive = item.children!.some((child) => child.to === pathname);
  const [open, setOpen] = useState(containsActive);

  return (
    <Collapsible
      open={open}
      onOpenChange={(next) => {
        // In icon mode the children are hidden, so expand the sidebar to show them.
        if (state === "collapsed" && !isMobile) {
          setSidebarOpen(true);
          setOpen(true);
        } else {
          setOpen(next);
        }
      }}
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={
          <SidebarMenuButton
            className={NAV_BUTTON_CLASS}
            isActive={containsActive && state === "collapsed"}
            tooltip={{ children: item.title, side: TOOLTIP_SIDE }}
          />
        }
      >
        <item.icon />
        <span>{item.title}</span>
        <ChevronLeftIcon className="ms-auto size-3.5! opacity-60 transition-transform duration-200 in-data-panel-open:-rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub className="mx-0 ms-4 me-0 translate-x-0 gap-0 border-none px-0 py-0 rtl:translate-x-0">
          {item.children!.map((child) => (
            <SidebarMenuSubItem key={child.to} className={TREE_ITEM_CLASS}>
              <SidebarMenuSubButton
                className={NAV_SUB_BUTTON_CLASS}
                isActive={pathname === child.to}
                render={<NavLink to={child.to} end />}
              >
                <span>{child.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

function NavUser() {
  const user = useUserStore((state) => state.user);
  const signOut = useUserStore((state) => state.signOut);
  const { isMobile } = useSidebar();
  if (!user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="hover:bg-sidebar-accent/60 data-popup-open:bg-sidebar-accent"
              />
            }
          >
            <Avatar className="size-8 rounded-lg after:rounded-lg">
              <AvatarFallback className="rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                <UserIcon className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-start leading-tight">
              <span dir="ltr" className="truncate text-end font-medium text-sidebar-accent-foreground">
                {formatPhoneNumber(user.phoneNumber)}
              </span>
              <span className="truncate text-xs text-sidebar-foreground/70">مدير المؤسسة</span>
            </div>
            <ChevronsUpDownIcon className="ms-auto size-4 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "top" : TOOLTIP_SIDE}
            align="end"
            sideOffset={8}
            className="w-56"
          >
            <DropdownMenuItem variant="destructive" onClick={() => void signOut()}>
              <LogOutIcon />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
