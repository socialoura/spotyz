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
      CREATE TABLE IF NOT EXISTS google_ads_expenses (
        month TEXT PRIMARY KEY,
        amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const result = await sql`SELECT * FROM google_ads_expenses ORDER BY month DESC`;
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[GET GOOGLE ADS EXPENSES ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { month, amount } = await request.json();

    if (!month || amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await sql`
      INSERT INTO google_ads_expenses (month, amount)
      VALUES (${month}, ${amount})
      ON CONFLICT (month) DO UPDATE SET amount = ${amount}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CREATE GOOGLE ADS EXPENSE ERROR]', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
