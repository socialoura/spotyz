import { NextRequest, NextResponse } from 'next/server';
import { sendDiscordOrderNotification } from '@/lib/discord';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, email, username, platform, followers, price, promoCode } = body;

    if (!orderId || !email || !username || !platform || !followers || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendDiscordOrderNotification({
      orderId,
      email,
      username,
      platform,
      followers,
      price,
      promoCode,
    });

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to send Discord notification', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in discord-notification API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
