import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === adminUsername && password === adminPassword) {
      const tokenData = {
        username,
        role: 'admin',
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      };
      const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');

      return NextResponse.json({ success: true, token });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('[ADMIN LOGIN ERROR]', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
