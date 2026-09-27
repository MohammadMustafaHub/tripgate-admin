import { useState } from "react";
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  LayoutGridIcon,
  MailIcon,
  MessageCircleIcon,
  PhoneIcon,
  SendIcon,
  Share2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useCurrentTenant } from "@/hooks/use-current-tenant";
import { tenantHost, tenantUrl } from "@/lib/tenant-url";

interface SharePlatform {
  name: string;
  /** Tile colour; the platform's brand colour. */
  className: string;
  icon: React.ReactNode;
  href: (url: string, text: string) => string;
}

const e = encodeURIComponent;

const PLATFORMS: SharePlatform[] = [
  {
    name: "واتساب",
    className: "bg-[#25D366]",
    icon: <MessageCircleIcon />,
    href: (url, text) => `https://wa.me/?text=${e(`${text}\n${url}`)}`,
  },
  {
    name: "تيليجرام",
    className: "bg-[#229ED9]",
    icon: <SendIcon />,
    href: (url, text) => `https://t.me/share/url?url=${e(url)}&text=${e(text)}`,
  },
  {
    name: "فايبر",
    className: "bg-[#7360F2]",
    icon: <PhoneIcon />,
    href: (url, text) => `viber://forward?text=${e(`${text}\n${url}`)}`,
  },
  {
    name: "فيسبوك",
    className: "bg-[#1877F2]",
    icon: <span className="text-lg leading-none font-bold">f</span>,
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`,
  },
  {
    name: "إكس",
    className: "bg-black",
    icon: <span className="text-base leading-none font-bold">𝕏</span>,
    href: (url, text) => `https://twitter.com/intent/tweet?url=${e(url)}&text=${e(text)}`,
  },
  {
    name: "البريد",
    className: "bg-neutral-600",
    icon: <MailIcon />,
    href: (url, text) => `mailto:?subject=${e(text)}&body=${e(`${text}\n${url}`)}`,
  },
];

export function AppMenu() {
  const { data: tenant, isPending } = useCurrentTenant();
  const [copied, setCopied] = useState(false);

  const url = tenant ? tenantUrl(tenant.subdomain) : "";
  const shareText = tenant ? `تفضلوا بزيارة موقع ${tenant.name} لحجز رحلاتكم:` : "";
  const canShareNatively = typeof navigator !== "undefined" && "share" in navigator;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.add({ type: "error", title: "تعذّر نسخ الرابط." });
    }
  }

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" size="icon" aria-label="موقع المؤسسة" className="text-muted-foreground" />}>
        <LayoutGridIcon />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-0 p-0">
        <div className="flex flex-col gap-0.5 px-4 pt-3 pb-3">
          <PopoverTitle className="font-semibold">موقع مؤسستك</PopoverTitle>
          <PopoverDescription className="text-xs">الرابط الذي يحجز من خلاله عملاؤك رحلاتهم.</PopoverDescription>
        </div>

        <div className="px-4 pb-4">
          {isPending || !tenant ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div dir="ltr" className="flex h-10 items-center gap-1 rounded-lg border bg-muted/50 ps-3 pe-1">
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{tenantHost(tenant.subdomain)}</span>
              <Button variant="ghost" size="icon-sm" aria-label="نسخ الرابط" onClick={copyLink}>
                {copied ? <CheckIcon className="text-emerald-600" /> : <CopyIcon />}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="فتح الموقع"
                render={<a href={url} target="_blank" rel="noopener noreferrer" />}
              >
                <ExternalLinkIcon />
              </Button>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex flex-col gap-3 px-4 pt-3 pb-4">
          <p className="text-xs font-medium text-muted-foreground">مشاركة الرابط عبر</p>
          <div className="grid grid-cols-3 gap-2">
            {PLATFORMS.map((platform) => (
              <a
                key={platform.name}
                href={tenant ? platform.href(url, shareText) : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!tenant}
                className="flex flex-col items-center gap-1.5 rounded-lg py-2 text-xs transition-colors hover:bg-muted aria-disabled:pointer-events-none aria-disabled:opacity-50"
              >
                <span
                  className={`flex size-9 items-center justify-center rounded-full text-white [&_svg]:size-4.5 ${platform.className}`}
                >
                  {platform.icon}
                </span>
                {platform.name}
              </a>
            ))}
          </div>
          {canShareNatively && (
            <Button
              variant="outline"
              disabled={!tenant}
              onClick={() => navigator.share({ title: tenant?.name, text: shareText, url }).catch(() => {})}
            >
              <Share2Icon />
              خيارات مشاركة أخرى
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
