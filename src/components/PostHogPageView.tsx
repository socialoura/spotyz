'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { Suspense, useEffect } from 'react';
import { captureFirstTouchAttribution, getFirstTouchAttribution } from '@/lib/attribution';

function PostHogPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (!posthog || !pathname) return;

    captureFirstTouchAttribution();

    const params = searchParams ? Object.fromEntries(searchParams.entries()) : {};
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
    const utmProps: Record<string, string> = {};
    for (const key of utmKeys) {
      const value = params[key];
      if (value) utmProps[key] = value;
    }

    let url = window.origin + pathname;
    if (searchParams && searchParams.toString()) {
      url = `${url}?${searchParams.toString()}`;
    }

    const firstTouch = getFirstTouchAttribution();

    posthog.capture('$pageview', {
      $current_url: url,
      ...utmProps,
      ...firstTouch,
    });
  }, [pathname, searchParams, posthog]);

  return null;
}

export function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageViewInner />
    </Suspense>
  );
}
