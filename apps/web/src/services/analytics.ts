import posthog from "posthog-js";

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;

export function initAnalytics() {
  if (!KEY) return;
  posthog.init(KEY, { api_host: import.meta.env.VITE_POSTHOG_HOST, capture_pageview: true });
}

// Never pass full wallet addresses, names, emails, notes, or proof URLs here.
export function track(event: string, props: Record<string, unknown> = {}) {
  if (!KEY) return;
  posthog.capture(event, props);
}
