import { create } from "zustand";
import {
  AutoCertTableSlice,
  createAutoCertTableSlice,
} from "./autocertTableSlice";
import {
  AutoCertChangeSlice,
  createAutoCertChangeSlice,
} from "./autocertChangeSlice";
import { AutocertSlice, createAutocertSlice } from "./autocertSlice";
import { immer } from "zustand/middleware/immer";
import {
  AutocertSettingSlice,
  createAutocertSettingSlice,
} from "./autocertSettingSlice";
import { AutocertPdfSlice, createAutocertPdfSlice } from "./autocertPdfSlice";
import {
  AutocertZoomSlice,
  createAutocertZoomSlice,
} from "./autocertZoomSlice";
import {
  AutocertAnnotateSlice,
  createAutocertAnnotateSlice,
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
    immer(
      (...a) => (
      {
      ...createAutocertSlice(...a),
      ...createAutoCertChangeSlice(...a),
      ...createAutoCertTableSlice(...a),
      ...createAutocertSettingSlice(...a),
      ...createAutocertPdfSlice(...a),
      ...createAutocertZoomSlice(...a),
      ...createAutocertAnnotateSlice(...a),
    })),
  );
