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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const secretResult = await sql`SELECT value FROM settings WHERE key = 'stripe_secret_key'`;
    const publishableResult = await sql`SELECT value FROM settings WHERE key = 'stripe_publishable_key'`;

    const secretKey = secretResult.rows.length > 0 ? secretResult.rows[0].value : '';
    const publishableKey = publishableResult.rows.length > 0 ? publishableResult.rows[0].value : '';

    const maskedSecret = secretKey ? secretKey.slice(0, 7) + '...' + secretKey.slice(-4) : '';

    return NextResponse.json({
      secretKey: maskedSecret,
      publishableKey,
      connected: !!(secretKey && publishableKey && secretKey.startsWith('sk_') && publishableKey.startsWith('pk_')),
    });
  } catch (error) {
    console.error('[GET STRIPE SETTINGS ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { secretKey, publishableKey } = await request.json();

    if (secretKey && !secretKey.startsWith('sk_') && !secretKey.includes('...')) {
      return NextResponse.json({ error: 'Secret key must start with sk_' }, { status: 400 });
    }

    if (publishableKey && !publishableKey.startsWith('pk_')) {
      return NextResponse.json({ error: 'Publishable key must start with pk_' }, { status: 400 });
    }

    if (secretKey && !secretKey.includes('...')) {
      await sql`
        INSERT INTO settings (key, value) VALUES ('stripe_secret_key', ${secretKey})
        ON CONFLICT (key) DO UPDATE SET value = ${secretKey}, updated_at = CURRENT_TIMESTAMP
      `;
    }

    if (publishableKey) {
      await sql`
        INSERT INTO settings (key, value) VALUES ('stripe_publishable_key', ${publishableKey})
        ON CONFLICT (key) DO UPDATE SET value = ${publishableKey}, updated_at = CURRENT_TIMESTAMP
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[UPDATE STRIPE SETTINGS ERROR]', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
