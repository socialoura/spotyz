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

    const impressionsNumber = Number(impressions);
    const priceNumber = Number(price);
    const originalPriceNumber = Number(originalPrice);

    if (!Number.isFinite(impressionsNumber) || impressionsNumber <= 0) {
      return NextResponse.json({ error: 'Invalid impressions' }, { status: 400 });
    }
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }
    if (!Number.isFinite(originalPriceNumber) || originalPriceNumber <= 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const discount = Math.round((1 - priceNumber / originalPriceNumber) * 100);
    const id = `pkg_${impressionsNumber >= 1000 ? (impressionsNumber / 1000) + 'k' : impressionsNumber}`;

    await sql`
      INSERT INTO packages (id, impressions, price, original_price, discount_percentage, is_active, description)
      VALUES (${id}, ${impressionsNumber}, ${priceNumber}, ${originalPriceNumber}, ${discount}, ${isActive !== false}, ${description || null})
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

    const { id, impressions, price, originalPrice, isActive, description } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
    }

    const updates: string[] = [];
    const values: Array<string | number | boolean | null> = [];
    let index = 1;

    const impressionsNumber = impressions === undefined ? undefined : Number(impressions);
    const priceNumber = price === undefined ? undefined : Number(price);
    const originalPriceNumber = originalPrice === undefined ? undefined : Number(originalPrice);

    if (impressions !== undefined) {
      if (!Number.isFinite(impressionsNumber) || (impressionsNumber as number) <= 0) {
        return NextResponse.json({ error: 'Invalid impressions' }, { status: 400 });
      }
      updates.push(`impressions = $${index++}`);
      values.push(impressionsNumber as number);
    }

    if (price !== undefined) {
      if (!Number.isFinite(priceNumber) || (priceNumber as number) <= 0) {
        return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
      }
      updates.push(`price = $${index++}`);
      values.push(priceNumber as number);
    }

    if (originalPrice !== undefined) {
      if (!Number.isFinite(originalPriceNumber) || (originalPriceNumber as number) <= 0) {
        return NextResponse.json({ error: 'Invalid originalPrice' }, { status: 400 });
      }
      updates.push(`original_price = $${index++}`);
      values.push(originalPriceNumber as number);
    }

    if (isActive !== undefined) {
      updates.push(`is_active = $${index++}`);
      values.push(Boolean(isActive));
    }

    if (description !== undefined) {
      updates.push(`description = $${index++}`);
      values.push(description ? String(description) : null);
    }

    if (price !== undefined && originalPrice !== undefined) {
      const discount = Math.round((1 - (priceNumber as number) / (originalPriceNumber as number)) * 100);
      updates.push(`discount_percentage = $${index++}`);
      values.push(discount);
    }

    if (updates.length > 0) {
      updates.push(`created_at = created_at`);
      values.push(id);
      await sql.query(`UPDATE packages SET ${updates.join(', ')} WHERE id = $${index}`, values);
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
