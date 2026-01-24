import { NextRequest, NextResponse } from 'next/server';
import { getPromoEnabled, setPromoEnabled, initDatabase } from '@/lib/db';

// Initialize database on module load
initDatabase().catch(console.error);

// Verify admin token
function verifyToken(token: string | null): boolean {
  if (!token) return false;

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    if (decoded.exp && decoded.exp > Date.now()) {
      return decoded.role === 'admin';
    }
    return false;
  } catch {
    return false;
  }
}

// GET - Get promo enabled status
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enabled = await getPromoEnabled();
    return NextResponse.json({ enabled });
  } catch (error) {
    console.error('Error fetching promo settings:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// PUT - Update promo enabled status
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled must be a boolean' }, { status: 400 });
    }

    await setPromoEnabled(enabled);
    return NextResponse.json({ success: true, enabled });
  } catch (error) {
    console.error('Error updating promo settings:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
