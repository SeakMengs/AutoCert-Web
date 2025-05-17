import { StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createScopedLogger } from "@/utils/logger";
import { AutoCertStore } from "./useAutoCertStore";
import { DocumentCallback } from "react-pdf/src/shared/types.js";
import { IS_PRODUCTION } from "@/utils/env";

const logger = createScopedLogger("components:builder:store:autocertPdfSlice");

export type AutocertPdfSliceState = {
  totalPdfPage: number;
  currentPdfPage: number;
  pdfFileUrl?: string;
};

export interface AutocertPdfSliceActions {
  initPdf: (pdfFileUrl: string) => void;
  setTotalPdfPage: (pageCount: number) => void;
  setCurrentPdfPage: (page: number) => void;
  onDocumentLoadSuccess: (pdf: DocumentCallback) => Promise<void>;
  onPageClick: (page: number) => void;
}

export type AutocertPdfSlice = AutocertPdfSliceState & AutocertPdfSliceActions;

export const createAutocertPdfSlice: StateCreator<
  AutoCertStore,
  [["zustand/immer", never]],
  [],
  AutocertPdfSlice
> = (set, get) => {
  return {
    totalPdfPage: 0,
    currentPdfPage: 0,
    pdfFileUrl: undefined,

    initPdf: (pdfFileUrl) => {
      logger.debug("Initializing PDF with URL", pdfFileUrl);
      set((state) => {
        state.pdfFileUrl = pdfFileUrl;
        state.totalPdfPage = 0;
        state.currentPdfPage = 0;
      });
    },

    setTotalPdfPage: (pageCount) =>
      set((state) => {
        state.totalPdfPage = pageCount;
      }),
    setCurrentPdfPage: (page) =>
      set((state) => {
        state.currentPdfPage = page;
      }),

    onPageClick: (page) => {
      get().setCurrentPdfPage(page);
    },

    onDocumentLoadSuccess: async (pdf) => {
      if (!pdf) {
        logger.warn("Pdf loaded but Pdf is null");
        return;
      }

      logger.debug(`Pdf loaded, total pages: ${pdf.numPages}`);

      get().setTotalPdfPage(pdf.numPages);
      get().setCurrentPdfPage(1);

      if (!IS_PRODUCTION) {
        const page = await pdf.getPage(1);
        const width = page.view[2];
        const height = page.view[3];
        logger.debug(`Pdf width: ${width}, height: ${height}`);
      }
    },
  };
};
