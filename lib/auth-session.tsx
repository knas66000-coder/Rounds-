import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { clearRoundsSessionToken, getRoundsSessionToken, setRoundsSessionToken } from "@/lib/rounds-session";

export type RoundsLearner = { id: number; name: string; email: string; lastSignedIn: Date };
type Credentials = { email: string; password: string };
type Registration = Credentials & { name: string };
type AuthSession = {
  user: RoundsLearner | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  signIn: (input: Credentials) => Promise<void>;
  register: (input: Registration) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSession | null>(null);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const utils = trpc.useUtils();
  const [ready, setReady] = useState(false);
  const [hasStoredSession, setHasStoredSession] = useState(false);
  const [user, setUser] = useState<RoundsLearner | null>(null);
  const [sessionError, setSessionError] = useState<Error | null>(null);
  const me = trpc.roundsAuth.me.useQuery(undefined, { enabled: ready, retry: false });
  const signInMutation = trpc.roundsAuth.signIn.useMutation();
  const registerMutation = trpc.roundsAuth.register.useMutation();
  const signOutMutation = trpc.roundsAuth.signOut.useMutation();

  useEffect(() => {
    let active = true;
    void getRoundsSessionToken().then((token) => {
      if (!active) return;
      setHasStoredSession(Boolean(token));
      if (!token) setUser(null);
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (me.data) {
      setUser(me.data);
      setSessionError(null);
    } else if (me.isError && hasStoredSession) {
      setUser(null);
      setSessionError(me.error instanceof Error ? me.error : new Error("Your session could not be confirmed."));
      void clearRoundsSessionToken();
    }
  }, [hasStoredSession, me.data, me.error, me.isError, ready]);

  const acceptSession = useCallback(async (session: { token: string; user: RoundsLearner }) => {
    await setRoundsSessionToken(session.token);
    setHasStoredSession(true);
    setUser(session.user);
    setSessionError(null);
    utils.roundsAuth.me.setData(undefined, session.user);
    await utils.academicProfile.get.invalidate();
  }, [utils]);

  const signIn = useCallback(async (input: Credentials) => {
    await acceptSession(await signInMutation.mutateAsync(input));
  }, [acceptSession, signInMutation]);

  const register = useCallback(async (input: Registration) => {
    await acceptSession(await registerMutation.mutateAsync(input));
  }, [acceptSession, registerMutation]);

  const logout = useCallback(async () => {
    try { await signOutMutation.mutateAsync(); } catch { /* Local removal still ends access. */ }
    await clearRoundsSessionToken();
    setHasStoredSession(false);
    setUser(null);
    setSessionError(null);
    utils.roundsAuth.me.setData(undefined, undefined);
    await utils.academicProfile.get.invalidate();
  }, [signOutMutation, utils]);

  const refresh = useCallback(async () => {
    const token = await getRoundsSessionToken();
    if (!token) { setHasStoredSession(false); setUser(null); return; }
    const next = await me.refetch();
    if (next.data) { setUser(next.data); setSessionError(null); }
  }, [me.refetch]);

  const value = useMemo<AuthSession>(() => ({
    user,
    loading: !ready || (me.isFetching && !user),
    isAuthenticated: Boolean(user),
    error: sessionError,
    refresh,
    signIn,
    register,
    logout,
  }), [me.isFetching, ready, refresh, register, sessionError, signIn, user, logout]);

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const auth = useContext(AuthSessionContext);
  if (!auth) throw new Error("useAuthSession must be used inside AuthSessionProvider.");
  return auth;
}
