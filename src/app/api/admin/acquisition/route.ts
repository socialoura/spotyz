import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/sql';

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

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || 'all';

    // Ensure attribution columns exist (idempotent)
    try {
      await sql`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255)`;
      await sql`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(255)`;
      await sql`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255)`;
      await sql`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS referrer TEXT`;
      await sql`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS referring_domain VARCHAR(255)`;
      await sql`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS landing_page TEXT`;
    } catch { /* already exists */ }

    let dateClause = '';
    const now = new Date();
    if (dateRange === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateClause = `AND created_at >= '${start.toISOString()}'`;
    } else if (dateRange === 'week') {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateClause = `AND created_at >= '${start.toISOString()}'`;
    } else if (dateRange === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      dateClause = `AND created_at >= '${start.toISOString()}'`;
    }

    const baseWhere = `deleted_at IS NULL ${dateClause}`;

    // Top referring domains
    const referringDomainsResult = await sql.query(
      `SELECT
        COALESCE(NULLIF(referring_domain, ''), 'direct') as source,
        COUNT(*)::int as orders_count,
        COALESCE(SUM(COALESCE(amount, price, 0)), 0)::float as revenue
       FROM public.orders
       WHERE ${baseWhere}
       GROUP BY COALESCE(NULLIF(referring_domain, ''), 'direct')
       ORDER BY orders_count DESC
       LIMIT 10`
    );

    // Top UTM sources
    const utmSourcesResult = await sql.query(
      `SELECT
        COALESCE(NULLIF(utm_source, ''), '(none)') as source,
        COUNT(*)::int as orders_count,
        COALESCE(SUM(COALESCE(amount, price, 0)), 0)::float as revenue
       FROM public.orders
       WHERE ${baseWhere}
       GROUP BY COALESCE(NULLIF(utm_source, ''), '(none)')
       ORDER BY orders_count DESC
       LIMIT 10`
    );

    // Top UTM campaigns
    const utmCampaignsResult = await sql.query(
      `SELECT
        COALESCE(NULLIF(utm_campaign, ''), '(none)') as campaign,
        COALESCE(NULLIF(utm_source, ''), '(none)') as source,
        COALESCE(NULLIF(utm_medium, ''), '(none)') as medium,
        COUNT(*)::int as orders_count,
        COALESCE(SUM(COALESCE(amount, price, 0)), 0)::float as revenue
       FROM public.orders
       WHERE ${baseWhere}
       GROUP BY 1, 2, 3
       ORDER BY orders_count DESC
       LIMIT 10`
    );

    // Country breakdown
    const countryResult = await sql.query(
      `SELECT
        COALESCE(NULLIF(country, ''), 'Unknown') as country,
        COUNT(*)::int as orders_count,
        COALESCE(SUM(COALESCE(amount, price, 0)), 0)::float as revenue
       FROM public.orders
       WHERE ${baseWhere}
       GROUP BY COALESCE(NULLIF(country, ''), 'Unknown')
       ORDER BY orders_count DESC
       LIMIT 20`
    );

    // Daily timeline (last 30 days) with breakdown by referring_domain (top 5)
    const timelineResult = await sql.query(
      `SELECT
        DATE_TRUNC('day', created_at) as day,
        COALESCE(NULLIF(referring_domain, ''), 'direct') as source,
        COUNT(*)::int as orders_count,
        COALESCE(SUM(COALESCE(amount, price, 0)), 0)::float as revenue
       FROM public.orders
       WHERE ${baseWhere} AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY 1, 2
       ORDER BY 1 ASC`
    );

    // Totals
    const totalsResult = await sql.query(
      `SELECT
        COUNT(*)::int as total_orders,
        COALESCE(SUM(COALESCE(amount, price, 0)), 0)::float as total_revenue,
        COUNT(DISTINCT COALESCE(NULLIF(referring_domain, ''), 'direct'))::int as unique_sources
       FROM public.orders
       WHERE ${baseWhere}`
    );

    return NextResponse.json({
      totals: totalsResult.rows[0] || { total_orders: 0, total_revenue: 0, unique_sources: 0 },
      referringDomains: referringDomainsResult.rows,
      utmSources: utmSourcesResult.rows,
      utmCampaigns: utmCampaignsResult.rows,
      countries: countryResult.rows,
      timeline: timelineResult.rows,
    });
  } catch (error) {
    console.error('[GET ACQUISITION ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch acquisition data' }, { status: 500 });
  }
}
