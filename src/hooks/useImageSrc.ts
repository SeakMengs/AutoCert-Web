import { IMAGE_PLACEHOLDER } from "@/utils/image";
import { useState, useCallback, ReactEventHandler, useEffect } from "react";

/**
 * Hook for managing image src with a fallback placeholder on error.
 * Compatible with both standard img elements and Next.js Image component.
 */
export function useImageSrc(
  originalSrc: string,
  placeholderSrc: string = IMAGE_PLACEHOLDER,
) {
  const [loading, setLoading] = useState<boolean>(false);
  const [src, setSrc] = useState<string>(originalSrc);
  const [hadError, setHadError] = useState<boolean>(false);

  // Reset src when originalSrc changes
  useEffect(() => {
    setSrc(originalSrc);
    setLoading(true);
    setHadError(false);
  }, [originalSrc]);

  const onError = useCallback<ReactEventHandler<HTMLImageElement>>(
    (event) => {
      const img = event.currentTarget;
      // Only swap if not already placeholder and not already handled
      if (img.src !== placeholderSrc && !hadError) {
        // Prevent infinite loops by clearing handler before swap
        img.onerror = null;
        setSrc(placeholderSrc);
        setHadError(true);
        setLoading(false);
      }
    },
    [placeholderSrc, hadError],
  );

  const onLoadStart = useCallback(() => {
    setLoading(true);
  }, []);

  const onLoadingComplete = useCallback(() => {
    setLoading(false);
  }, []);

  return {
    src,
    loading,
    onError,
    onLoadingComplete,
    onLoadStart,
    isPlaceholder: hadError || src === placeholderSrc,
  };
}
