import { ConstructionIcon } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

/** Stands in for dashboard pages that are linked from the sidebar but not built yet. */
export default function PlaceholderPage() {
  return (
    <Empty className="flex-1">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ConstructionIcon />
        </EmptyMedia>
        <EmptyTitle>قريباً</EmptyTitle>
        <EmptyDescription>هذه الصفحة قيد التطوير وستكون متاحة قريباً.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
