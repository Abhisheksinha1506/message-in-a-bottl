import "server-only";

/** Exact owned origins only: aliases preserve sessions during a domain change. */
export function trustedAppOrigins(
  fallback: string,
  primary = process.env.NEXT_PUBLIC_APP_URL,
  aliases = process.env.APP_ALLOWED_ORIGINS,
) {
  return new Set(
    [primary || fallback, ...(aliases || "").split(",")]
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => {
        const url = new URL(value);
        if (
          !["http:", "https:"].includes(url.protocol) ||
          url.username ||
          url.password ||
          url.hostname.includes("*") ||
          url.pathname !== "/" ||
          url.search ||
          url.hash
        )
          throw new Error("Application origins must be exact HTTP(S) origins.");
        return url.origin;
      }),
  );
}

export function authRedirectOrigin(
  requestOrigin: string,
  primary = process.env.NEXT_PUBLIC_APP_URL,
  aliases = process.env.APP_ALLOWED_ORIGINS,
) {
  const origins = trustedAppOrigins(requestOrigin, primary, aliases);
  // Session cookies are host-bound; do not redirect a valid alias to another host.
  return origins.has(requestOrigin) ? requestOrigin : [...origins][0];
}
