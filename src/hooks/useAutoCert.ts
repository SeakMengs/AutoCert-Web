import { AutoCertContext } from "@/components/builder/context/AutoCertProvider";
import { useContext } from "react";

export function useAutoCert() {
  const context = useContext(AutoCertContext);

  if (!context) {
    throw new Error("useAutoCert must be used within a AutoCertProvider");
  }

  return context;
}
