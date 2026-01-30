import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, isDBConfigured } from '@/lib/db';
import { sql } from '@vercel/postgres';

// Initialize database on module load
initDatabase().catch(console.error);

export async function POST(request: NextRequest) {
  try {
    if (!isDBConfigured()) {
      return NextResponse.json(
        { error: 'Database is not configured' },
        { status: 500 }
      );
    }

    const { username, email, platform, followers, amount, paymentId, youtubeVideoUrl } = await request.json();

    // Validate required fields
    if (!username || !platform || !followers || !amount || !paymentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (platform === 'youtube' && !youtubeVideoUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if order with this payment_id already exists
    const existing = await sql`
      SELECT id FROM public.orders WHERE payment_id = ${paymentId} OR payment_intent_id = ${paymentId}
    `;
    
    if (existing.rows.length > 0) {
      // Order already exists, return existing ID (idempotent)
      const countResult = await sql`SELECT COUNT(*)::int AS count FROM public.orders`;
      const maxIdResult = await sql`SELECT MAX(id)::int AS max_id FROM public.orders`;
      const dbResult = await sql`SELECT current_database() AS db, current_schema() AS schema`;
      const serverResult = await sql`SELECT inet_server_addr()::text AS server_ip, inet_server_port()::int AS server_port`;
      const res = NextResponse.json({
        success: true,
        orderId: existing.rows[0].id,
        existing: true,
        meta: {
          count: countResult.rows?.[0]?.count ?? null,
          max_id: maxIdResult.rows?.[0]?.max_id ?? null,
          db: dbResult.rows?.[0]?.db ?? null,
          schema: dbResult.rows?.[0]?.schema ?? null,
          server_ip: serverResult.rows?.[0]?.server_ip ?? null,
          server_port: serverResult.rows?.[0]?.server_port ?? null,
        },
      });
      res.headers.set('Cache-Control', 'no-store');
      return res;
    }

    // Insert the order
    const result = await sql`
      INSERT INTO public.orders (username, email, platform, followers, amount, price, payment_id, payment_intent_id, status, payment_status, youtube_video_url) 
      VALUES (${username}, ${email || null}, ${platform}, ${followers}, ${amount}, ${amount}, ${paymentId}, ${paymentId}, 'completed', 'completed', ${youtubeVideoUrl || null})
      RETURNING id
    `;

    console.log('Order created:', result.rows[0]?.id, 'for payment:', paymentId);

    const countResult = await sql`SELECT COUNT(*)::int AS count FROM public.orders`;
    const maxIdResult = await sql`SELECT MAX(id)::int AS max_id FROM public.orders`;
    const dbResult = await sql`SELECT current_database() AS db, current_schema() AS schema`;
    const serverResult = await sql`SELECT inet_server_addr()::text AS server_ip, inet_server_port()::int AS server_port`;

    const res = NextResponse.json({
      success: true,
      orderId: result.rows[0].id,
      created: true,
      meta: {
        count: countResult.rows?.[0]?.count ?? null,
        max_id: maxIdResult.rows?.[0]?.max_id ?? null,
        db: dbResult.rows?.[0]?.db ?? null,
        schema: dbResult.rows?.[0]?.schema ?? null,
        server_ip: serverResult.rows?.[0]?.server_ip ?? null,
        server_port: serverResult.rows?.[0]?.server_port ?? null,
      },
    });

    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error) {
    console.error('Error saving order:', error);
    return NextResponse.json(
      { error: 'Failed to save order' },
      { status: 500 }
    );
  }
}
