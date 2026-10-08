import { useEffect, useState } from "react";
import { ImageUpIcon, RefreshCwIcon, Trash2Icon } from "lucide-react";
import { RemoteImage } from "@/components/remote-image";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFileDrop } from "@/hooks/use-file-drop";
import { formatFileSize, validateImageFiles } from "@/lib/image-files";
import { imageUrl } from "@/lib/images";
import type { Result } from "@/lib/result";
import { cn } from "@/lib/utils";
import type { UploadedImage } from "@/models/media";

const UPLOAD_FAILED = "تعذّر رفع الصورة. يرجى المحاولة مرة أخرى.";

/**
 * Single image picker. Uploads as soon as an image is dropped or chosen and reports the
 * storage key through `onChange`.
 */
export function ImageUpload({
  id,
  value,
  onChange,
  upload,
  maxSize,
  disabled = false,
  invalid = false,
  fit = "cover",
  className,
}: {
  id?: string;
  /** Storage key of the current image. */
  value: string | null;
  onChange: (key: string | null) => void;
  upload: (file: File) => Promise<Result<UploadedImage, string>>;
  /** Largest accepted file, in bytes. */
  maxSize: number;
  disabled?: boolean;
  invalid?: boolean;
  /** "contain" shows the whole image, e.g. for logos. */
  fit?: "cover" | "contain";
  className?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploading = preview !== null;

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  async function handleFiles(files: File[]) {
    const { accepted, errors } = validateImageFiles(files.slice(0, 1), maxSize);
    setError(errors[0] ?? null);
    const file = accepted[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    const result = await upload(file);
    setPreview(null);
    if (result.ok) onChange(result.value.key);
    else setError(UPLOAD_FAILED);
  }

  const { isDragging, open, rootProps, inputProps } = useFileDrop({
    onFiles: handleFiles,
    disabled: disabled || uploading,
  });

  const src = preview ?? imageUrl(value);

  return (
    <div className="flex flex-col gap-2">
      <div
        {...rootProps}
        data-dragging={isDragging || undefined}
        aria-invalid={invalid || undefined}
        className={cn(
          "relative aspect-video w-full overflow-hidden rounded-xl border-2 border-dashed border-input bg-muted/40 transition-colors",
          "data-dragging:border-primary data-dragging:bg-primary/5 aria-invalid:border-destructive",
          src && "border-solid",
          className,
        )}
      >
        <input id={id} {...inputProps} />

        {src ? (
          <>
            {preview ? (
              <img src={preview} alt="" className={cn("size-full", fit === "contain" ? "object-contain p-4" : "object-cover")} />
            ) : (
              <RemoteImage
                src={src}
                alt="الصورة المختارة"
                className={cn("size-full", fit === "contain" && "bg-transparent object-contain p-4")}
              />
            )}
            {uploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 text-sm font-medium text-white">
                <Spinner className="size-6" />
                جارٍ رفع الصورة…
              </div>
            ) : (
              <div className="absolute bottom-3 end-3 flex gap-2">
                <Button type="button" size="sm" variant="secondary" className="shadow-sm" onClick={open} disabled={disabled}>
                  <RefreshCwIcon />
                  تغيير
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="text-destructive shadow-sm"
                  onClick={() => onChange(null)}
                  disabled={disabled}
                >
                  <Trash2Icon />
                  إزالة
                </Button>
              </div>
            )}
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/15 text-sm font-medium text-primary">
                أفلت الصورة لاستبدالها
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={open}
            disabled={disabled}
            className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-card text-muted-foreground ring-1 ring-border">
              <ImageUpIcon className="size-5" />
            </span>
            <span className="text-sm">
              اسحب الصورة وأفلتها هنا، أو <span className="font-medium text-primary">اختر من جهازك</span>
            </span>
            <span className="text-xs text-muted-foreground">صورة واحدة بحجم أقصاه {formatFileSize(maxSize)}</span>
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
