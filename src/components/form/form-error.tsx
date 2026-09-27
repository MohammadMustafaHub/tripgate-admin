import { CircleAlertIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function FormError({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <Alert variant="destructive" className="border-destructive/40 bg-destructive/5">
      <CircleAlertIcon />
      <AlertDescription className="text-destructive">{message}</AlertDescription>
    </Alert>
  );
}

export const UNKNOWN_ERROR_MESSAGE = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
