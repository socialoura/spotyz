import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, isDBConfigured } from '@/lib/db';
import { sql } from '@vercel/postgres';

// Initialize database on module load
initDatabase().catch(console.error);

export async function POST(request: NextRequest) {
  try {
    if (!isDBConfigured()) {
      return NextResponse.json(
        { error: 'Database is not configured' },
        { status: 500 }
      );
    }

    const { username, email, platform, followers, amount, paymentId, youtubeVideoUrl } = await request.json();

    // Validate required fields
    if (!username || !platform || !followers || !amount || !paymentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (platform === 'youtube' && !youtubeVideoUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert the order
    const result = await sql`
      INSERT INTO orders (username, email, platform, followers, amount, price, payment_id, payment_intent_id, status, payment_status, youtube_video_url) 
      VALUES (${username}, ${email || null}, ${platform}, ${followers}, ${amount}, ${amount}, ${paymentId}, ${paymentId}, 'completed', 'completed', ${youtubeVideoUrl || null})
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      orderId: result.rows[0].id
    });
  } catch (error) {
    console.error('Error saving order:', error);
    return NextResponse.json(
      { error: 'Failed to save order' },
      { status: 500 }
    );
  }
}
