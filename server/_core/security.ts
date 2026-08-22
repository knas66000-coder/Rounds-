export interface OriginEnvironment {
  NODE_ENV?: string;
  EXPO_WEB_PREVIEW_URL?: string;
  EXPO_PACKAGER_PROXY_URL?: string;
}

const ROUNDS_PRODUCTION_ORIGIN = "https://roundsnclex-mjcssreo.manus.space";

function asOrigin(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function configuredOrigins(environment: OriginEnvironment): Set<string> {
  return new Set(
    [
      ROUNDS_PRODUCTION_ORIGIN,
      asOrigin(environment.EXPO_WEB_PREVIEW_URL),
      asOrigin(environment.EXPO_PACKAGER_PROXY_URL),
    ].filter((origin): origin is string => Boolean(origin)),
  );
}

/**
 * Allows only known Rounds browser origins in production. Development accepts
 * local Expo hosts and the sandbox Metro preview, but only outside production.
 */
export function isTrustedBrowserOrigin(
  origin: string | undefined,
  environment: OriginEnvironment = process.env,
): boolean {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = asOrigin(origin);
  if (!normalizedOrigin) {
    return false;
  }

  if (configuredOrigins(environment).has(normalizedOrigin)) {
    return true;
  }

  if (environment.NODE_ENV === "production") {
    return false;
  }

  return (
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin) ||
    /^https:\/\/8081-[a-z0-9-]+(?:\.[a-z0-9-]+)*\.manus\.computer$/.test(normalizedOrigin)
  );
}

/** Security headers intended for JSON APIs and redirect responses. */
export function apiSecurityHeaders(isProduction: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Security-Policy": "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
    "Cross-Origin-Resource-Policy": "same-site",
    "Permissions-Policy": "camera=(), geolocation=(), payment=(), usb=()",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  };

  if (isProduction) {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  }

  return headers;
}
