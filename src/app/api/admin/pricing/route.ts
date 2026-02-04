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

// GET all packages
export async function GET() {
  try {
    // Ensure packages table exists
    await sql`
      CREATE TABLE IF NOT EXISTS packages (
        id TEXT PRIMARY KEY,
        impressions INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2) NOT NULL,
        discount_percentage INT,
        is_active BOOLEAN DEFAULT TRUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const result = await sql`
      SELECT * FROM packages ORDER BY impressions ASC
    `;

    // If no packages, insert defaults
    if (result.rows.length === 0) {
      const defaultPackages = [
        { id: 'pkg_250', impressions: 250, price: 0.99, originalPrice: 1.99 },
        { id: 'pkg_500', impressions: 500, price: 1.49, originalPrice: 3.99 },
        { id: 'pkg_1k', impressions: 1000, price: 2.49, originalPrice: 7.99 },
        { id: 'pkg_2.5k', impressions: 2500, price: 5.99, originalPrice: 19.99 },
        { id: 'pkg_10k', impressions: 10000, price: 18.99, originalPrice: 79.99 },
        { id: 'pkg_25k', impressions: 25000, price: 39.99, originalPrice: 199.99 },
        { id: 'pkg_50k', impressions: 50000, price: 69.99, originalPrice: 399.99 },
        { id: 'pkg_100k', impressions: 100000, price: 129.99, originalPrice: 799.99 },
        { id: 'pkg_250k', impressions: 250000, price: 299.99, originalPrice: 1999.99 },
      ];

      for (const pkg of defaultPackages) {
        const discount = Math.round((1 - pkg.price / pkg.originalPrice) * 100);
        await sql`
          INSERT INTO packages (id, impressions, price, original_price, discount_percentage, is_active)
          VALUES (${pkg.id}, ${pkg.impressions}, ${pkg.price}, ${pkg.originalPrice}, ${discount}, TRUE)
          ON CONFLICT (id) DO NOTHING
        `;
      }

      const newResult = await sql`SELECT * FROM packages ORDER BY impressions ASC`;
      return NextResponse.json(newResult.rows);
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[GET PACKAGES ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

// POST create new package
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { impressions, price, originalPrice, isActive, description } = await request.json();

    if (!impressions || !price || !originalPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const discount = Math.round((1 - price / originalPrice) * 100);
    const id = `pkg_${impressions >= 1000 ? (impressions / 1000) + 'k' : impressions}`;

    await sql`
      INSERT INTO packages (id, impressions, price, original_price, discount_percentage, is_active, description)
      VALUES (${id}, ${impressions}, ${price}, ${originalPrice}, ${discount}, ${isActive !== false}, ${description || null})
    `;

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('[CREATE PACKAGE ERROR]', error);
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}

// PUT update package
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, price, originalPrice, isActive, description } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
    }

    const updates: string[] = [];
    if (price !== undefined) updates.push(`price = ${price}`);
    if (originalPrice !== undefined) updates.push(`original_price = ${originalPrice}`);
    if (isActive !== undefined) updates.push(`is_active = ${isActive}`);
    if (description !== undefined) updates.push(`description = '${description}'`);

    if (price !== undefined && originalPrice !== undefined) {
      const discount = Math.round((1 - price / originalPrice) * 100);
      updates.push(`discount_percentage = ${discount}`);
    }

    if (updates.length > 0) {
      await sql.query(`UPDATE packages SET ${updates.join(', ')} WHERE id = $1`, [id]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[UPDATE PACKAGE ERROR]', error);
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
  }
}

// DELETE package
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
    }

    await sql`DELETE FROM packages WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE PACKAGE ERROR]', error);
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
  }
}
