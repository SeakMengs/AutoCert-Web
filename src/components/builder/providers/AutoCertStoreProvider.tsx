"use client";

import { createContext, useRef, useContext, PropsWithChildren } from "react";
import { useStore } from "zustand";
import {
  AutoCertStore,
  createAutoCertStore,
} from "@/components/builder/store/useAutoCertStore";
import { AutocertSlice } from "../store/autocertSlice";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger(
  "components:builder:providers:AutoCertStoreProvider",
);

export type AutoCertStoreApi = ReturnType<typeof createAutoCertStore>;

export const AutoCertStoreContext = createContext<AutoCertStoreApi | undefined>(
  undefined,
);

export interface AutoCertStoreProviderProps {
  value: Parameters<AutocertSlice["init"]>[0];
}

export const AutoCertStoreProvider = ({
  value,
  children,
}: PropsWithChildren<AutoCertStoreProviderProps>) => {
  const storeRef = useRef<AutoCertStoreApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createAutoCertStore();
    storeRef.current.getState().init(value);
  }

  return (
    <AutoCertStoreContext.Provider value={storeRef.current}>
      {children}
    </AutoCertStoreContext.Provider>
  );
};

export const useAutoCertStore = <T,>(
  selector: (store: AutoCertStore) => T,
): T => {
  const autoCertStoreContext = useContext(AutoCertStoreContext);

  if (!autoCertStoreContext) {
    throw new Error(
      `useAutoCertStore must be used within AutoCertStoreProvider`,
    );
  }

  return useStore(autoCertStoreContext, selector);
};
