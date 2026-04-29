'use client';

import posthog from 'posthog-js';
import { getConversionAttribution } from '@/lib/attribution';

function isReady(): boolean {
  return typeof window !== 'undefined' && Boolean(posthog.__loaded);
}

export function trackPackageViewed(args: { packageId: string; price: number; impressions: number }) {
  if (!isReady()) return;
  posthog.capture('package_viewed', {
    package_id: args.packageId,
    price: args.price,
    impressions: args.impressions,
  });
}

export function trackCheckoutStarted(args: {
  packageId: string;
  price: number;
  impressions: number;
  email?: string;
}) {
  if (!isReady()) return;
  posthog.capture('checkout_started', {
    package_id: args.packageId,
    price: args.price,
    impressions: args.impressions,
    email: args.email,
    ...getConversionAttribution(),
  });
}

export function trackOrderCompleted(args: {
  orderId: string | number;
  amount: number;
  packageId?: string;
  impressions?: number;
  country?: string;
  email?: string;
}) {
  if (!isReady()) return;
  posthog.capture('order_completed', {
    order_id: String(args.orderId),
    amount: args.amount,
    package_id: args.packageId,
    impressions: args.impressions,
    country: args.country,
    email: args.email,
    ...getConversionAttribution(),
  });
}

export function trackPromoCodeApplied(args: { code: string; discount: number }) {
  if (!isReady()) return;
  posthog.capture('promo_code_applied', {
    code: args.code,
    discount: args.discount,
  });
}

export function identifyUser(email: string, properties?: Record<string, unknown>) {
  if (!isReady() || !email) return;
  posthog.identify(email, {
    email,
    ...properties,
  });
}

export function resetIdentity() {
  if (!isReady()) return;
  posthog.reset();
}
