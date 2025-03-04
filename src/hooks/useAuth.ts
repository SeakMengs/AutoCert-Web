import { AuthContext, AuthContextValue } from "@/app/auth_provider";
import { useContext } from "react";

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
