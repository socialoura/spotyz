import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

// Verify admin token
function verifyToken(token: string | null): boolean {
  if (!token) return false;
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return decoded.exp && decoded.exp > Date.now() && decoded.role === 'admin';
  } catch {
    return false;
  }
}

// GET all orders for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const debug = request.nextUrl.searchParams.get('debug') === '1';

    // Check authorization
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch ALL orders from database - no filtering
    const result = await sql`
      SELECT 
        id,
        username,
        email,
        platform,
        followers,
        amount,
        price,
        payment_id,
        status,
        payment_status,
        order_status,
        notes,
        youtube_video_url,
        cost,
        created_at,
        updated_at
      FROM public.orders 
      ORDER BY created_at DESC
    `;

    const orders = result.rows;
    console.log('[ADMIN ORDERS]', { count: orders.length });

    if (debug) {
      const unqualifiedCountResult = await sql`SELECT COUNT(*)::int AS count FROM orders`;
      const unqualifiedIdsResult = await sql`SELECT id FROM orders ORDER BY created_at DESC LIMIT 50`;
      const countResult = await sql`SELECT COUNT(*)::int AS count FROM public.orders`;
      const qualifiedIdsResult = await sql`SELECT id FROM public.orders ORDER BY created_at DESC LIMIT 50`;
      const dbResult = await sql`SELECT current_database() AS db, current_schema() AS schema`;
      const resolutionResult = await sql`
        SELECT
          current_setting('search_path') AS search_path,
          to_regclass('orders')::text AS reg_orders,
          to_regclass('public.orders')::text AS reg_public_orders
      `;
      const res = NextResponse.json({
        orders,
        meta: {
          select_rows: orders.length,
          count: countResult.rows?.[0]?.count ?? null,
          unqualified_count: unqualifiedCountResult.rows?.[0]?.count ?? null,
          db: dbResult.rows?.[0]?.db ?? null,
          schema: dbResult.rows?.[0]?.schema ?? null,
          search_path: resolutionResult.rows?.[0]?.search_path ?? null,
          reg_orders: resolutionResult.rows?.[0]?.reg_orders ?? null,
          reg_public_orders: resolutionResult.rows?.[0]?.reg_public_orders ?? null,
          public_order_ids: qualifiedIdsResult.rows?.map((r) => r.id) ?? [],
          unqualified_order_ids: unqualifiedIdsResult.rows?.map((r) => r.id) ?? [],
        },
      });
      res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return res;
    }

    const response = NextResponse.json(orders);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;

  } catch (error) {
    console.error('[ADMIN ORDERS ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
