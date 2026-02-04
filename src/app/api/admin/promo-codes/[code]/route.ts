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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await params;
    const body = await request.json();
    const { discountValue, minPurchase, maxUses, expiresAt, isActive } = body;

    const updates: string[] = [];
    const values: (string | number | boolean | null)[] = [];

    if (discountValue !== undefined) {
      updates.push(`discount_value = $${values.length + 1}`);
      values.push(discountValue);
    }

    if (minPurchase !== undefined) {
      updates.push(`min_purchase = $${values.length + 1}`);
      values.push(minPurchase);
    }

    if (maxUses !== undefined) {
      updates.push(`max_uses = $${values.length + 1}`);
      values.push(maxUses);
    }

    if (expiresAt !== undefined) {
      updates.push(`expires_at = $${values.length + 1}`);
      values.push(expiresAt);
    }

    if (isActive !== undefined) {
      updates.push(`is_active = $${values.length + 1}`);
      values.push(isActive);
    }

    if (updates.length > 0) {
      values.push(code.toUpperCase());
      await sql.query(
        `UPDATE promo_codes SET ${updates.join(', ')} WHERE code = $${values.length}`,
        values
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[UPDATE PROMO CODE ERROR]', error);
    return NextResponse.json({ error: 'Failed to update promo code' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await params;
    await sql`DELETE FROM promo_codes WHERE code = ${code.toUpperCase()}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE PROMO CODE ERROR]', error);
    return NextResponse.json({ error: 'Failed to delete promo code' }, { status: 500 });
  }
}
