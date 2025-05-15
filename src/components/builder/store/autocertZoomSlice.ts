import { StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createScopedLogger } from "@/utils/logger";
import { AutoCertStore } from "./useAutoCertStore";
import { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";

const logger = createScopedLogger("components:builder:store:autocertZoomSlice");

type AutocertZoomSliceState = {
  zoom: number;
  transformWrapperRef: ReactZoomPanPinchContentRef | null;
};

interface AutocertZoomSliceActions {
  setZoom: (scale: number) => void;
  onZoomChange: (newZoom: number) => void;
}

export type AutocertZoomSlice = AutocertZoomSliceState &
  AutocertZoomSliceActions;

export const createAutocertZoomSlice: StateCreator<
  AutoCertStore,
  [["zustand/immer", never]],
  [],
  AutocertZoomSlice
> = (set, get) => {
  return {
    zoom: 1,
    transformWrapperRef: null,

    setZoom: (scale) =>
      set((state) => {
        state.zoom = scale;
      }),

    onZoomChange: (newZoom) => {
      logger.debug(`Zoom changed to ${newZoom}`);
      if (get().zoom === newZoom) {
        // logger.debug(`Zoom scale not changed: ${zoomScale} skip state update`);
        return;
      }

      get().setZoom(newZoom);
    },
  };
};
