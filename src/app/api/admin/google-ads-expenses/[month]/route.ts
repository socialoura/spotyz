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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ month: string }> }) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { month } = await params;
    const { amount } = await request.json();

    if (amount === undefined) {
      return NextResponse.json({ error: 'Amount required' }, { status: 400 });
    }

    await sql`UPDATE google_ads_expenses SET amount = ${amount} WHERE month = ${month}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[UPDATE GOOGLE ADS EXPENSE ERROR]', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ month: string }> }) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { month } = await params;
    await sql`DELETE FROM google_ads_expenses WHERE month = ${month}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE GOOGLE ADS EXPENSE ERROR]', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
