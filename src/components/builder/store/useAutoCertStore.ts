import { create } from "zustand";
import {
  AutoCertTableSlice,
  createAutoCertTableSlice,
} from "./autocertTableSlice";
import {
  AutoCertChangeSlice,
  createAutoCertChangeSlice,
} from "./autocertChangeSlice";
import { AutocertSlice, createAutoCertSlice } from "./autocertSlice";
import { immer } from "zustand/middleware/immer";
import {
  AutocertSettingSlice,
  createAutoCertSettingSlice,
} from "./autocertSettingSlice";
import { AutocertPdfSlice, createAutoCertPdfSlice } from "./autocertPdfSlice";
import {
  AutocertZoomSlice,
  createAutoCertZoomSlice,
} from "./autocertZoomSlice";
import {
  AutocertAnnotateSlice,
  createAutoCertAnnotateSlice,
} from "./autocertAnnotate";
import { setAutoFreeze } from "immer";

setAutoFreeze(false);

export type AutoCertStore = AutocertSlice &
  AutoCertChangeSlice &
  AutoCertTableSlice &
  AutocertSettingSlice &
  AutocertPdfSlice &
  AutocertZoomSlice &
  AutocertAnnotateSlice;

export const createAutoCertStore = () =>
  create<AutoCertStore>()(
    immer((...a) => ({
      ...createAutoCertSlice(...a),
      ...createAutoCertChangeSlice(...a),
      ...createAutoCertTableSlice(...a),
      ...createAutoCertSettingSlice(...a),
      ...createAutoCertPdfSlice(...a),
      ...createAutoCertZoomSlice(...a),
      ...createAutoCertAnnotateSlice(...a),
    })),
  );
