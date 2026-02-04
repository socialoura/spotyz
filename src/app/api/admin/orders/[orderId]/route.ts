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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await params;
    const body = await request.json();
    const { status, cost, notes, impressionsDelivered } = body;

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (status !== undefined) {
      const validStatuses = ['pending', 'processing', 'in_progress', 'completed', 'cancelled', 'refunded'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updates.push(`status = $${values.length + 1}`);
      values.push(status);
      if (status === 'completed') {
        updates.push(`completed_at = CURRENT_TIMESTAMP`);
      }
    }

    if (cost !== undefined) {
      if (cost < 0) {
        return NextResponse.json({ error: 'Cost must be >= 0' }, { status: 400 });
      }
      updates.push(`cost = $${values.length + 1}`);
      values.push(cost);
    }

    if (notes !== undefined) {
      updates.push(`notes = $${values.length + 1}`);
      values.push(notes);
    }

    if (impressionsDelivered !== undefined) {
      updates.push(`impressions_delivered = $${values.length + 1}`);
      values.push(impressionsDelivered);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(orderId);
      await sql.query(
        `UPDATE youtube_orders SET ${updates.join(', ')} WHERE order_id = $${values.length}`,
        values
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[UPDATE ORDER ERROR]', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await params;

    await sql`UPDATE youtube_orders SET deleted_at = CURRENT_TIMESTAMP WHERE order_id = ${orderId}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE ORDER ERROR]', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
