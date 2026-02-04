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
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const deliverySpeed = await sql`SELECT value FROM settings WHERE key = 'delivery_speed'`;
    const autoComplete = await sql`SELECT value FROM settings WHERE key = 'auto_complete'`;
    const emailNotifications = await sql`SELECT value FROM settings WHERE key = 'email_notifications'`;
    const adminEmail = await sql`SELECT value FROM settings WHERE key = 'admin_email'`;

    return NextResponse.json({
      deliverySpeed: deliverySpeed.rows[0]?.value || 'normal',
      autoComplete: autoComplete.rows[0]?.value === 'true',
      emailNotifications: emailNotifications.rows[0]?.value !== 'false',
      adminEmail: adminEmail.rows[0]?.value || '',
    });
  } catch (error) {
    console.error('[GET SERVICE SETTINGS ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deliverySpeed, autoComplete, emailNotifications, adminEmail } = await request.json();

    if (deliverySpeed !== undefined) {
      await sql`
        INSERT INTO settings (key, value) VALUES ('delivery_speed', ${deliverySpeed})
        ON CONFLICT (key) DO UPDATE SET value = ${deliverySpeed}, updated_at = CURRENT_TIMESTAMP
      `;
    }

    if (autoComplete !== undefined) {
      await sql`
        INSERT INTO settings (key, value) VALUES ('auto_complete', ${autoComplete ? 'true' : 'false'})
        ON CONFLICT (key) DO UPDATE SET value = ${autoComplete ? 'true' : 'false'}, updated_at = CURRENT_TIMESTAMP
      `;
    }

    if (emailNotifications !== undefined) {
      await sql`
        INSERT INTO settings (key, value) VALUES ('email_notifications', ${emailNotifications ? 'true' : 'false'})
        ON CONFLICT (key) DO UPDATE SET value = ${emailNotifications ? 'true' : 'false'}, updated_at = CURRENT_TIMESTAMP
      `;
    }

    if (adminEmail !== undefined) {
      await sql`
        INSERT INTO settings (key, value) VALUES ('admin_email', ${adminEmail})
        ON CONFLICT (key) DO UPDATE SET value = ${adminEmail}, updated_at = CURRENT_TIMESTAMP
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[UPDATE SERVICE SETTINGS ERROR]', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
