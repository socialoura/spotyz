import { NextResponse } from 'next/server';
import { getPromoEnabled, initDatabase } from '@/lib/db';

// Initialize database on module load
initDatabase().catch(console.error);

// GET - Check if promo codes are enabled (public endpoint)
export async function GET() {
  try {
    const enabled = await getPromoEnabled();
    return NextResponse.json({ enabled });
  } catch (error) {
    console.error('Error fetching promo status:', error);
    return NextResponse.json({ enabled: true }); // Default to true on error
  }
}
