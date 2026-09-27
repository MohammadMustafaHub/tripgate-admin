import { BellIcon, BellOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";

// The API has no notifications endpoint yet, so the list is always empty for now.
export function NotificationsMenu() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" size="icon" aria-label="الإشعارات" className="text-muted-foreground" />}>
        <BellIcon />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-0 p-0">
        <div className="border-b px-4 py-3">
          <PopoverTitle className="font-semibold">الإشعارات</PopoverTitle>
        </div>
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <BellOffIcon className="size-6 text-muted-foreground" />
          <p className="font-medium">لا توجد إشعارات</p>
          <p className="text-xs text-muted-foreground">ستظهر هنا التنبيهات المتعلقة بمؤسستك وحجوزاتها.</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
