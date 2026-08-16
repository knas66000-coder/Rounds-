export type AccessState = "loading" | "callback" | "sign-in" | "app";

export function accessStateFor({ loading, isAuthenticated, isCallback }: { loading: boolean; isAuthenticated: boolean; isCallback: boolean }): AccessState {
  if (isCallback) return "callback";
  if (loading) return "loading";
  return isAuthenticated ? "app" : "sign-in";
}
