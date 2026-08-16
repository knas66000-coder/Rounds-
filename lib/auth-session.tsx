import { createContext, type ReactNode, useContext } from "react";
import { useAuth } from "@/hooks/use-auth";

type AuthSession = ReturnType<typeof useAuth>;

const AuthSessionContext = createContext<AuthSession | null>(null);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  return <AuthSessionContext.Provider value={auth}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const auth = useContext(AuthSessionContext);
  if (!auth) throw new Error("useAuthSession must be used inside AuthSessionProvider.");
  return auth;
}
