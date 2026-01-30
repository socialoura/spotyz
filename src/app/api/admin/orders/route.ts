import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, initDatabase, isDBConfigured } from '@/lib/db';

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

    const orders = await getAllOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching orders' },
      { status: 500 }
    );
  }
}
