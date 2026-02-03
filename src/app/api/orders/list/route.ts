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

export async function GET(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all orders using SELECT * to avoid column mismatch issues
    const result = await sql`
      SELECT * FROM public.orders ORDER BY created_at DESC
    `;

    const response = NextResponse.json(result.rows);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;

  } catch (error) {
    console.error('[ORDERS LIST ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
