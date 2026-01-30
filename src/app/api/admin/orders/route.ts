import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, isDBConfigured } from '@/lib/db';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

// Initialize database on module load
initDatabase().catch(console.error);


// Verify admin token
function verifyToken(token: string | null): boolean {
  if (!token) return false;

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    // Check if token is expired (24 hours)
    if (decoded.exp && decoded.exp > Date.now()) {
      return decoded.role === 'admin';
    }
    return false;
  } catch {
    return false;
  }
}

// GET orders
export async function GET(request: NextRequest) {
  try {
    const debug = request.nextUrl.searchParams.get('debug') === '1';

    // Check authorization
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    if (!verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get orders from database
    if (!isDBConfigured()) {
      return NextResponse.json(
        { error: 'Database is not configured. Please set POSTGRES_URL in Vercel environment variables.' },
        { status: 500 }
      );
    }

    const ordersResult = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
    const orders = ordersResult.rows;

    if (debug) {
      const countResult = await sql`SELECT COUNT(*)::int AS count FROM orders`;
      const maxIdResult = await sql`SELECT MAX(id)::int AS max_id FROM orders`;
      const dbResult = await sql`SELECT current_database() AS db, current_schema() AS schema`;
      const serverResult = await sql`SELECT inet_server_addr()::text AS server_ip, inet_server_port()::int AS server_port`;
      const res = NextResponse.json({
        orders,
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

    const res = NextResponse.json(orders);
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching orders' },
      { status: 500 }
    );
  }
}
