import { NextRequest, NextResponse } from 'next/server';
import { getPricing, setPricing, initDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Initialize database on module load
initDatabase().catch(console.error);

// Default pricing data
const DEFAULT_PRICING = {
  youtube: [
    { followers: '1000', price: '4.90' },
    { followers: '2500', price: '9.90' },
    { followers: '5000', price: '17.90' },
    { followers: '10000', price: '29.90' },
    { followers: '25000', price: '59.90' },
    { followers: '50000', price: '99.90' },
  ],
};

// In-memory fallback for development without database
let memoryStore: { youtube: Array<{ followers: string; price: string; originalPrice?: string }> } | null = null;

// Check if database is configured
const isDBConfigured = () => {
  return !!process.env.POSTGRES_URL;
};

// Storage abstraction
const storage = {
  async get() {
    if (isDBConfigured()) {
      try {
        return await getPricing();
      } catch (error) {
        console.error('Database get error:', error);
        return memoryStore;
      }
    } else {
      // Use in-memory store for local development
      return memoryStore;
    }
  },

  async set(_key: string, value: { youtube: Array<{ followers: string; price: string; originalPrice?: string }> }) {
    if (isDBConfigured()) {
      try {
        await setPricing(value);
      } catch (error) {
        console.error('Database set error:', error);
        memoryStore = value;
      }
    } else {
      // Use in-memory store for local development
      memoryStore = value;
    }
  }
};

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

// GET pricing data
export async function GET() {
  try {
    // Try to read from storage
    const pricing = await storage.get();
    if (pricing) {
      // Backward compatibility: if DB has instagram/tiktok shape, map to youtube.
      const typedPricing = pricing as Record<string, Array<{ followers: string; price: string; originalPrice?: string }>>;
      if (typedPricing.youtube) {
        return NextResponse.json({ youtube: typedPricing.youtube });
      }
      if (typedPricing.instagram) {
        return NextResponse.json({ youtube: typedPricing.instagram });
      }
      return NextResponse.json(DEFAULT_PRICING);
    }
    // If no data in storage, return default pricing
    return NextResponse.json(DEFAULT_PRICING);
  } catch (error) {
    console.error('Error fetching pricing:', error);
    // If storage fails, return default pricing
    return NextResponse.json(DEFAULT_PRICING);
  }
}

// Shared update logic
async function updatePricing(request: NextRequest) {
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

    const body = await request.json();
    const { youtube, instagram } = body;

    const normalizedYoutube = youtube || instagram;

    // Validate data
    if (!normalizedYoutube || !Array.isArray(normalizedYoutube)) {
      return NextResponse.json(
        { error: 'Invalid pricing data format' },
        { status: 400 }
      );
    }

    // Save to storage
    await storage.set('pricing-data', { youtube: normalizedYoutube });

    return NextResponse.json({ success: true, message: 'Pricing updated successfully' });
  } catch (error) {
    console.error('Error updating pricing:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating pricing' },
      { status: 500 }
    );
  }
}

// PUT update pricing data
export async function PUT(request: NextRequest) {
  return updatePricing(request);
}

// POST update pricing data (alias for PUT to handle method conversion)
export async function POST(request: NextRequest) {
  return updatePricing(request);
}
