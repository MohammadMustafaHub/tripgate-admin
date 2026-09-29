import { useRef, useState } from "react";

/**
 * Drag-and-drop plus file-explorer picking for a drop zone.
 * Spread `rootProps` on the zone, render `<input {...inputProps} />` inside it, and call `open()` to browse.
 */
export function useFileDrop({
  onFiles,
  accept = "image/*",
  multiple = false,
  disabled = false,
}: {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  // dragenter/dragleave also fire for children, so count them to know when the pointer really left.
  const depth = useRef(0);

  const open = () => {
    if (!disabled) inputRef.current?.click();
  };

  const rootProps = {
    onDragEnter: (event: React.DragEvent) => {
      event.preventDefault();
      if (disabled) return;
      depth.current += 1;
      setIsDragging(true);
    },
    onDragOver: (event: React.DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = disabled ? "none" : "copy";
    },
    onDragLeave: (event: React.DragEvent) => {
      event.preventDefault();
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setIsDragging(false);
    },
    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      depth.current = 0;
      setIsDragging(false);
      if (disabled) return;
      const files = Array.from(event.dataTransfer.files);
      if (files.length > 0) onFiles(multiple ? files : files.slice(0, 1));
    },
  };

  const inputProps = {
    ref: inputRef,
    type: "file",
    accept,
    multiple,
    disabled,
    hidden: true,
    tabIndex: -1,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      // Reset so picking the same file again still fires a change.
      event.target.value = "";
      if (files.length > 0) onFiles(files);
    },
  } as const;

  return { isDragging, open, rootProps, inputProps };
}
