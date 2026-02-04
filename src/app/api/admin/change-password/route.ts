import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both current and new password required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (currentPassword !== adminPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password change requires updating ADMIN_PASSWORD environment variable' 
    });
  } catch (error) {
    console.error('[CHANGE PASSWORD ERROR]', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
