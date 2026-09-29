import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Image from a URL that falls back to a neutral placeholder when missing or broken. */
export function RemoteImage({ src, alt, className }: { src: string | null | undefined; alt: string; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div className={cn("flex items-center justify-center bg-muted text-muted-foreground/60", className)}>
        <ImageIcon className="size-8" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      className={cn("bg-muted object-cover", className)}
    />
  );
}
