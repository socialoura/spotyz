import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

function verifyToken(token: string | null): boolean {
  if (!token) return false;
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return decoded.exp && decoded.exp > Date.now() && decoded.role === 'admin';
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secretResult = await sql`SELECT value FROM settings WHERE key = 'stripe_secret_key'`;
    if (secretResult.rows.length === 0 || !secretResult.rows[0].value) {
      return NextResponse.json({ success: false, error: 'No secret key configured' });
    }

    const secretKey = secretResult.rows[0].value;

    const response = await fetch('https://api.stripe.com/v1/balance', {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      },
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      const error = await response.json();
      return NextResponse.json({ success: false, error: error.error?.message || 'Connection failed' });
    }
  } catch (error) {
    console.error('[TEST STRIPE CONNECTION ERROR]', error);
    return NextResponse.json({ success: false, error: 'Connection test failed' });
  }
}
