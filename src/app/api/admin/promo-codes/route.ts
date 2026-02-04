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
      CREATE TABLE IF NOT EXISTS promo_codes (
        code TEXT PRIMARY KEY,
        discount_type TEXT NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        min_purchase DECIMAL(10,2),
        max_uses INT DEFAULT -1,
        current_uses INT DEFAULT 0,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const result = await sql`SELECT * FROM promo_codes ORDER BY created_at DESC`;
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[GET PROMO CODES ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, discountType, discountValue, minPurchase, maxUses, expiresAt, isActive } = await request.json();

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const upperCode = code.toUpperCase();

    await sql`
      INSERT INTO promo_codes (code, discount_type, discount_value, min_purchase, max_uses, expires_at, is_active)
      VALUES (${upperCode}, ${discountType}, ${discountValue}, ${minPurchase || null}, ${maxUses || -1}, ${expiresAt || null}, ${isActive !== false})
    `;

    return NextResponse.json({ success: true, code: upperCode });
  } catch (error) {
    console.error('[CREATE PROMO CODE ERROR]', error);
    return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 });
  }
}
