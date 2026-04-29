import { PostHog } from 'posthog-node';

let cached: PostHog | null = null;

export function getServerPostHog(): PostHog | null {
  if (cached) return cached;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

  if (!key) return null;

  cached = new PostHog(key, {
    host,
    flushAt: 1,
    flushInterval: 0,
  });
  return cached;
}

export async function captureServerEvent(args: {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}) {
  const ph = getServerPostHog();
  if (!ph) return;
  try {
    ph.capture({
      distinctId: args.distinctId,
      event: args.event,
      properties: args.properties,
    });
    await ph.shutdown();
    cached = null;
  } catch (error) {
    console.error('[POSTHOG SERVER ERROR]', error);
  }
}
