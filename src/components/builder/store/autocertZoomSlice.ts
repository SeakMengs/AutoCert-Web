import { StateCreator } from "zustand";
import { createScopedLogger } from "@/utils/logger";
import { AutoCertStore } from "./useAutoCertStore";
import { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";
import { createRef, RefObject } from "react";

const logger = createScopedLogger("components:builder:store:autocertZoomSlice");

export type AutocertZoomSliceState = {
  zoom: number;
  transformWrapperRef: RefObject<ReactZoomPanPinchContentRef | null>;
};

export interface AutocertZoomSliceActions {
  setZoom: (scale: number) => void;
  onZoomChange: (newZoom: number) => void;
}

export type AutocertZoomSlice = AutocertZoomSliceState &
  AutocertZoomSliceActions;

export const createAutoCertZoomSlice: StateCreator<
  AutoCertStore,
  [["zustand/immer", never]],
  [],
  AutocertZoomSlice
> = (set, get) => {
  return {
    zoom: 1,
    transformWrapperRef: createRef<ReactZoomPanPinchContentRef>(),

    setZoom: (scale) =>
      set((state) => {
        state.zoom = scale;
      }),

    onZoomChange: (newZoom) => {
      if (get().zoom === newZoom) {
        logger.debug(`Zoom scale not changed: ${newZoom} skip state update`);
        return;
      }

      get().setZoom(newZoom);
    },
  };
};
