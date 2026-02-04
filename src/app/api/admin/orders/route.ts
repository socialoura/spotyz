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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const packageFilter = searchParams.get('package');
    const dateRange = searchParams.get('dateRange');
    const search = searchParams.get('search');

    // Query from the actual orders table used by /api/orders/create
    // Map columns to match expected frontend format
    let query = `
      SELECT 
        id::text as order_id,
        email,
        youtube_video_url as youtube_url,
        followers as impressions,
        COALESCE(impressions_delivered, 0) as impressions_delivered,
        COALESCE(amount, price, 0) as price,
        COALESCE(cost, 0) as cost,
        COALESCE(order_status, status, 'pending') as status,
        COALESCE(notes, '') as notes,
        payment_id as stripe_transaction_id,
        promo_code,
        COALESCE(discount_amount, 0) as discount_amount,
        created_at,
        updated_at,
        completed_at,
        deleted_at
      FROM orders 
      WHERE deleted_at IS NULL
    `;
    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (status && status !== 'all') {
      conditions.push(`COALESCE(order_status, status, 'pending') = $${values.length + 1}`);
      values.push(status);
    }

    if (packageFilter && packageFilter !== 'all') {
      conditions.push(`followers = $${values.length + 1}`);
      values.push(parseInt(packageFilter));
    }

    if (search) {
      conditions.push(`(email ILIKE $${values.length + 1} OR youtube_video_url ILIKE $${values.length + 1})`);
      values.push(`%${search}%`);
    }

    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      if (dateRange === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (dateRange === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (dateRange === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        startDate = new Date(0);
      }
      conditions.push(`created_at >= $${values.length + 1}`);
      values.push(startDate.toISOString());
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await sql.query(query, values);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[GET ORDERS ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, youtubeUrl, packageId, impressions, price, stripeTransactionId, promoCode, discountAmount } = await request.json();

    if (!email || !youtubeUrl || !impressions || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await sql`
      INSERT INTO youtube_orders (order_id, email, youtube_url, package_id, impressions, price, stripe_transaction_id, promo_code, discount_amount)
      VALUES (${orderId}, ${email}, ${youtubeUrl}, ${packageId || null}, ${impressions}, ${price}, ${stripeTransactionId || null}, ${promoCode || null}, ${discountAmount || 0})
    `;

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error('[CREATE ORDER ERROR]', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
