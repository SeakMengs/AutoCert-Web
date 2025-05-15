"use client";
import useAutoCert, {
  UseAutoCertProps,
} from "@/components/builder/hooks/useAutoCert";
import { createContext, PropsWithChildren } from "react";

export type AutoCertContextValue = ReturnType<typeof useAutoCert>;

export const AutoCertContext = createContext<AutoCertContextValue | undefined>(
  undefined,
);

export interface AutoCertProviderProps {
  value: UseAutoCertProps;
}

export const AutoCertProvider = ({
  children,
  value,
}: PropsWithChildren<AutoCertProviderProps>) => {
  const autoCert = useAutoCert(value);

  return (
    <AutoCertContext.Provider value={autoCert}>
      {children}
    </AutoCertContext.Provider>
  );
};
