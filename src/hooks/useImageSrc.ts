import { IMAGE_PLACEHOLDER } from "@/utils/image";
import { useState, useCallback, ReactEventHandler } from "react";

/**
 * Hook for managing image src with a fallback placeholder on error.
 */
export function useImageSrc(
  originalSrc: string,
  placeholderSrc: string = IMAGE_PLACEHOLDER,
) {
  const [src, setSrc] = useState<string>(originalSrc);

  const onError = useCallback<ReactEventHandler<HTMLImageElement>>(
    (event) => {
      const img = event.currentTarget;
      // Only swap if not already placeholder
      if (img.src !== placeholderSrc) {
        // Prevent infinite loops by clearing handler before swap
        img.onerror = null;
        setSrc(placeholderSrc);
      }
    },
    [placeholderSrc],
  );

  return { src, onError };
}
