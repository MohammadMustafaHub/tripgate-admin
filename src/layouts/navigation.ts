import { LayoutDashboardIcon, MapIcon, SettingsIcon, type LucideIcon } from "lucide-react";

export interface NavLeaf {
  title: string;
  to: string;
}

export interface NavItem {
  title: string;
  icon: LucideIcon;
  /** Set for a direct link; omit when the item only groups `children`. */
  to?: string;
  children?: NavLeaf[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "عام",
    items: [
      { title: "الرئيسية", icon: LayoutDashboardIcon, to: "/" },
      {
        title: "الرحلات",
        icon: MapIcon,
        children: [{ title: "برامج الرحلات", to: "/trip-programs" }],
      },
    ],
  },
  {
    label: "الإدارة",
    items: [
      {
        title: "الإعدادات",
        icon: SettingsIcon,
        children: [
          { title: "المؤسسة", to: "/settings/tenant" },
          { title: "الحساب", to: "/settings/account" },
        ],
      },
    ],
  },
];

/** Titles from the top-level item down to the page at `pathname`, for the breadcrumb. */
export function findNavTrail(pathname: string): string[] {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.to === pathname) return [item.title];
      const child = item.children?.find((c) => c.to === pathname);
      if (child) return [item.title, child.title];
    }
  }
  return [];
}
