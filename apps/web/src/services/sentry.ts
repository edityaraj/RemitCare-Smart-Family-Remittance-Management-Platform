import * as Sentry from "@sentry/react";

export function initErrorMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;
  Sentry.init({ dsn, tracesSampleRate: 0.2, environment: import.meta.env.MODE });
}
