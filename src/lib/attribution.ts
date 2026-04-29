'use client';

const STORAGE_KEY = 'spotyz_first_touch_v1';

export type FirstTouchAttribution = {
  first_utm_source?: string;
  first_utm_medium?: string;
  first_utm_campaign?: string;
  first_utm_term?: string;
  first_utm_content?: string;
  first_referrer?: string;
  first_referring_domain?: string;
  first_landing_page?: string;
  first_gclid?: string;
  first_fbclid?: string;
  first_touch_at?: string;
};

function safeGetLocalStorage(key: string): string | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetLocalStorage(key: string, value: string) {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function captureFirstTouchAttribution(): FirstTouchAttribution {
  if (typeof window === 'undefined') return {};

  const existing = safeGetLocalStorage(STORAGE_KEY);
  if (existing) {
    try {
      return JSON.parse(existing) as FirstTouchAttribution;
    } catch {
      // continue to recapture
    }
  }

  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer || '';
  let referringDomain = '';
  if (referrer) {
    try {
      referringDomain = new URL(referrer).hostname;
    } catch {
      // ignore
    }
  }

  const data: FirstTouchAttribution = {
    first_utm_source: params.get('utm_source') || undefined,
    first_utm_medium: params.get('utm_medium') || undefined,
    first_utm_campaign: params.get('utm_campaign') || undefined,
    first_utm_term: params.get('utm_term') || undefined,
    first_utm_content: params.get('utm_content') || undefined,
    first_gclid: params.get('gclid') || undefined,
    first_fbclid: params.get('fbclid') || undefined,
    first_referrer: referrer || undefined,
    first_referring_domain: referringDomain || undefined,
    first_landing_page: window.location.pathname + window.location.search,
    first_touch_at: new Date().toISOString(),
  };

  // Only persist if we actually have any meaningful data
  const hasData = Object.values(data).some((v) => v !== undefined);
  if (hasData) {
    safeSetLocalStorage(STORAGE_KEY, JSON.stringify(data));
  }
  return data;
}

export function getFirstTouchAttribution(): FirstTouchAttribution {
  const raw = safeGetLocalStorage(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as FirstTouchAttribution;
  } catch {
    return {};
  }
}

export function getCurrentAttribution(): {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  referring_domain?: string;
  landing_page?: string;
} {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer || '';
  let referringDomain = '';
  if (referrer) {
    try {
      referringDomain = new URL(referrer).hostname;
    } catch {
      // ignore
    }
  }
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
    gclid: params.get('gclid') || undefined,
    fbclid: params.get('fbclid') || undefined,
    referrer: referrer || undefined,
    referring_domain: referringDomain || undefined,
    landing_page: window.location.pathname + window.location.search,
  };
}

/**
 * Returns attribution to send with a conversion (order). Prefers first-touch values
 * but falls back to current session values when first-touch is missing.
 */
export function getConversionAttribution() {
  const first = getFirstTouchAttribution();
  const current = getCurrentAttribution();

  return {
    utm_source: first.first_utm_source || current.utm_source,
    utm_medium: first.first_utm_medium || current.utm_medium,
    utm_campaign: first.first_utm_campaign || current.utm_campaign,
    utm_term: first.first_utm_term || current.utm_term,
    utm_content: first.first_utm_content || current.utm_content,
    gclid: first.first_gclid || current.gclid,
    fbclid: first.first_fbclid || current.fbclid,
    referrer: first.first_referrer || current.referrer,
    referring_domain: first.first_referring_domain || current.referring_domain,
    landing_page: first.first_landing_page || current.landing_page,
  };
}
