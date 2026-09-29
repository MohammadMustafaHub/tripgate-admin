import { useEffect, useRef, useState } from "react";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { RemoteImage } from "@/components/remote-image";
import { Spinner } from "@/components/ui/spinner";
import { useFileDrop } from "@/hooks/use-file-drop";
import { formatNumber } from "@/lib/format";
import { formatFileSize, validateImageFiles } from "@/lib/image-files";
import { imageUrl } from "@/lib/images";
import type { Result } from "@/lib/result";
import { cn } from "@/lib/utils";
import type { UploadedImage } from "@/models/media";

const UPLOAD_FAILED = "تعذّر رفع الصور. يرجى المحاولة مرة أخرى.";

const TILE_CLASS = "relative aspect-square overflow-hidden rounded-lg border";

/**
 * Gallery picker. Every batch of dropped or chosen images is uploaded in one call and the
 * resulting storage keys are appended through `onChange`.
 */
export function MultiImageUpload({
  id,
  value,
  onChange,
  upload,
  maxSize,
  maxFiles,
  disabled = false,
  invalid = false,
}: {
  id?: string;
  /** Storage keys of the current images, in order. */
  value: string[];
  onChange: (keys: string[]) => void;
  upload: (files: File[]) => Promise<Result<UploadedImage[], string>>;
  /** Largest accepted file, in bytes. */
  maxSize: number;
  /** Most images the gallery may hold. */
  maxFiles: number;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const [pending, setPending] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Uploads resolve later; append to the latest value rather than the one captured at pick time.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const remaining = maxFiles - value.length - pending.length;

  async function handleFiles(files: File[]) {
    const { accepted, errors: rejected } = validateImageFiles(files, maxSize);
    const batch = accepted.slice(0, Math.max(remaining, 0));
    if (accepted.length > batch.length) {
      rejected.push(`يمكن إضافة ${formatNumber(maxFiles)} صور كحد أقصى، لذا تم تجاهل بعض الصور.`);
    }
    setErrors(rejected);
    if (batch.length === 0) return;

    const previews = batch.map((file) => URL.createObjectURL(file));
    setPending((current) => [...current, ...previews]);
    const result = await upload(batch);
    setPending((current) => current.filter((p) => !previews.includes(p)));
    previews.forEach((p) => URL.revokeObjectURL(p));

    if (result.ok) onChange([...valueRef.current, ...result.value.map((image) => image.key)]);
    else setErrors((current) => [...current, UPLOAD_FAILED]);
  }

  const { isDragging, open, rootProps, inputProps } = useFileDrop({
    onFiles: handleFiles,
    multiple: true,
    disabled: disabled || remaining <= 0,
  });

  return (
    <div className="flex flex-col gap-2">
      <div
        {...rootProps}
        data-dragging={isDragging || undefined}
        aria-invalid={invalid || undefined}
        className="rounded-xl border-2 border-dashed border-input p-3 transition-colors data-dragging:border-primary data-dragging:bg-primary/5 aria-invalid:border-destructive"
      >
        <input id={id} {...inputProps} />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {value.map((key, index) => (
            <div key={key} className={cn(TILE_CLASS, "group")}>
              <RemoteImage src={imageUrl(key)} alt={`صورة ${formatNumber(index + 1)}`} className="size-full" />
              <button
                type="button"
                aria-label={`إزالة الصورة ${formatNumber(index + 1)}`}
                disabled={disabled}
                onClick={() => onChange(value.filter((k) => k !== key))}
                className="absolute top-1.5 end-1.5 flex size-7 items-center justify-center rounded-full bg-black/60 text-white opacity-100 transition-opacity outline-none hover:bg-black/80 focus-visible:ring-3 focus-visible:ring-ring/50 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          ))}

          {pending.map((preview) => (
            <div key={preview} className={TILE_CLASS}>
              <img src={preview} alt="" className="size-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-white">
                <Spinner className="size-5" />
              </div>
            </div>
          ))}

          {remaining > 0 && (
            <button
              type="button"
              onClick={open}
              disabled={disabled}
              className={cn(
                TILE_CLASS,
                "flex flex-col items-center justify-center gap-1.5 border-dashed bg-muted/40 p-2 text-center text-xs text-muted-foreground transition-colors outline-none hover:border-primary/50 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
              )}
            >
              <ImagePlusIcon className="size-5" />
              إضافة صور
            </button>
          )}
        </div>

        <p className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>اسحب الصور وأفلتها هنا، أو اضغط «إضافة صور» لاختيارها من جهازك.</span>
          <span className="tabular-nums">
            {formatNumber(value.length)} / {formatNumber(maxFiles)} · حتى {formatFileSize(maxSize)} للصورة
          </span>
        </p>
      </div>

      {errors.length > 0 && (
        <ul role="alert" className="flex flex-col gap-1 text-sm text-destructive">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
