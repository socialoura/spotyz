import { NextResponse } from 'next/server';
import { sql } from '@/lib/sql';

export async function GET() {
  try {
    // Check if environment variables are set
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
    };

    if (!envCheck.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection not configured',
          envCheck,
        },
        { status: 500 }
      );
    }

    // Test the connection
    const result = await sql`SELECT 1 as test`;
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    return NextResponse.json({ 
      success: true,
      message: 'Database connection successful',
      envCheck,
      connectionTest: result.rows,
      tables: tables.rows,
      tableCount: tables.rows.length
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        envCheck: {
          DATABASE_URL: !!process.env.DATABASE_URL,
        }
      },
      { status: 500 }
    );
  }
}
