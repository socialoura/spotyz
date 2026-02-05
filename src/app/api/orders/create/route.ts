import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

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
    const { username, email, platform, followers, amount, paymentId, youtubeVideoUrl } = body;

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

    // Ensure country column exists
    try {
      await sql`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS country VARCHAR(10) DEFAULT 'Unknown'`;
    } catch { /* column may already exist */ }

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

    // Insert new order with all required fields
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
        ${youtubeVideoUrl || null},
        ${country},
        NOW()
      )
      RETURNING id, created_at
    `;

    const newOrder = result.rows[0];
    console.log('[ORDER CREATED]', { id: newOrder.id, username, platform, amount });

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
