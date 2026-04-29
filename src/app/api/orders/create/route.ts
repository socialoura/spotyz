import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/sql';
import { captureServerEvent } from '@/lib/posthog-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getCountryFromIP(ip: string): Promise<string> {
  try {
    const cleanIp = ip.split(',')[0].trim();
    if (!cleanIp || cleanIp === '127.0.0.1' || cleanIp === '::1') return 'Unknown';
    const res = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,countryCode,country`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    if (data.status === 'success') return data.countryCode || 'Unknown';
    return 'Unknown';
  } catch {
    return 'Unknown';
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const {
      username,
      email,
      platform,
      followers,
      amount,
      paymentId,
      spotifyUrl,
      attribution,
      posthogDistinctId,
    } = body;

    // Validate required fields
    if (!username || !platform || !followers || !amount || !paymentId) {
      return NextResponse.json(
        { error: 'Missing required fields', received: { username, platform, followers, amount, paymentId } },
        { status: 400 }
      );
    }

    // Convert cents to euros (amount always comes in cents from frontend, e.g. 249 = 2.49€)
    const amountInEuros = Number((amount / 100).toFixed(2));

    // Detect country from client IP
    const forwarded = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    const country = await getCountryFromIP(forwarded);

    // Ensure attribution columns exist
    try {
      await sql`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS country VARCHAR(10) DEFAULT 'Unknown'`;
      await sql`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255)`;
      await sql`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(255)`;
      await sql`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255)`;
      await sql`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_term VARCHAR(255)`;
      await sql`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_content VARCHAR(255)`;
      await sql`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS referrer TEXT`;
      await sql`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS referring_domain VARCHAR(255)`;
      await sql`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS landing_page TEXT`;
      await sql`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gclid VARCHAR(255)`;
      await sql`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS fbclid VARCHAR(255)`;
    } catch { /* columns may already exist */ }

    // Check if order already exists (idempotency)
    const existing = await sql`
      SELECT id FROM public.orders WHERE payment_id = ${paymentId}
    `;

    if (existing.rows.length > 0) {
      return NextResponse.json({
        success: true,
        orderId: existing.rows[0].id,
        message: 'Order already exists'
      });
    }

    const attr = (attribution || {}) as {
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      utm_term?: string;
      utm_content?: string;
      referrer?: string;
      referring_domain?: string;
      landing_page?: string;
      gclid?: string;
      fbclid?: string;
    };

    // Insert new order with attribution fields
    const result = await sql`
      INSERT INTO public.orders (
        username,
        email,
        platform,
        followers,
        amount,
        price,
        payment_id,
        payment_intent_id,
        status,
        payment_status,
        order_status,
        youtube_video_url,
        country,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        referrer,
        referring_domain,
        landing_page,
        gclid,
        fbclid,
        created_at
      ) VALUES (
        ${username},
        ${email || null},
        ${platform},
        ${followers},
        ${amountInEuros},
        ${amountInEuros},
        ${paymentId},
        ${paymentId},
        'completed',
        'completed',
        'pending',
        ${spotifyUrl || null},
        ${country},
        ${attr.utm_source || null},
        ${attr.utm_medium || null},
        ${attr.utm_campaign || null},
        ${attr.utm_term || null},
        ${attr.utm_content || null},
        ${attr.referrer || null},
        ${attr.referring_domain || null},
        ${attr.landing_page || null},
        ${attr.gclid || null},
        ${attr.fbclid || null},
        NOW()
      )
      RETURNING id, created_at
    `;

    const newOrder = result.rows[0];
    console.log('[ORDER CREATED]', { id: newOrder.id, username, platform, amount });

    // Server-side PostHog tracking (independent of client ad-blockers)
    const distinctId = email || posthogDistinctId || String(newOrder.id);
    captureServerEvent({
      distinctId,
      event: 'order_completed_server',
      properties: {
        order_id: String(newOrder.id),
        amount: amountInEuros,
        impressions: followers,
        platform,
        country,
        email: email || undefined,
        utm_source: attr.utm_source,
        utm_medium: attr.utm_medium,
        utm_campaign: attr.utm_campaign,
        utm_term: attr.utm_term,
        utm_content: attr.utm_content,
        referring_domain: attr.referring_domain,
        gclid: attr.gclid,
        fbclid: attr.fbclid,
      },
    }).catch(() => { /* non-blocking */ });

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      createdAt: newOrder.created_at
    });

  } catch (error) {
    console.error('[ORDER CREATE ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
