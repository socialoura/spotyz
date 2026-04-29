'use client';

import { useState, useEffect, useCallback } from 'react';

interface SourceRow {
  source: string;
  orders_count: number;
  revenue: number;
}

interface CampaignRow {
  campaign: string;
  source: string;
  medium: string;
  orders_count: number;
  revenue: number;
}

interface CountryRow {
  country: string;
  orders_count: number;
  revenue: number;
}

interface TimelineRow {
  day: string;
  source: string;
  orders_count: number;
  revenue: number;
}

interface Totals {
  total_orders: number;
  total_revenue: number;
  unique_sources: number;
}

interface Props {
  token: string;
}

const COUNTRY_FLAGS: Record<string, string> = {
  FR: 'France', US: 'United States', GB: 'United Kingdom', DE: 'Germany',
  ES: 'Spain', IT: 'Italy', BE: 'Belgium', CH: 'Switzerland', CA: 'Canada',
  NL: 'Netherlands', BR: 'Brazil', MX: 'Mexico', JP: 'Japan', AU: 'Australia',
};

export default function AcquisitionTab({ token }: Props) {
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState<Totals>({ total_orders: 0, total_revenue: 0, unique_sources: 0 });
  const [referringDomains, setReferringDomains] = useState<SourceRow[]>([]);
  const [utmSources, setUtmSources] = useState<SourceRow[]>([]);
  const [utmCampaigns, setUtmCampaigns] = useState<CampaignRow[]>([]);
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [timeline, setTimeline] = useState<TimelineRow[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/acquisition?dateRange=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTotals(data.totals || { total_orders: 0, total_revenue: 0, unique_sources: 0 });
      setReferringDomains(data.referringDomains || []);
      setUtmSources(data.utmSources || []);
      setUtmCampaigns(data.utmCampaigns || []);
      setCountries(data.countries || []);
      setTimeline(data.timeline || []);
    } catch (e) {
      console.error('Failed to fetch acquisition data:', e);
    } finally {
      setLoading(false);
    }
  }, [dateRange, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build daily totals for the chart (sum across all sources per day)
  const dailyTotals = timeline.reduce<Record<string, number>>((acc, row) => {
    const day = new Date(row.day).toISOString().slice(0, 10);
    acc[day] = (acc[day] || 0) + row.orders_count;
    return acc;
  }, {});
  const dailyDays = Object.keys(dailyTotals).sort();
  const maxDaily = Math.max(1, ...Object.values(dailyTotals));

  const maxRefOrders = Math.max(1, ...referringDomains.map((r) => r.orders_count));
  const maxUtmOrders = Math.max(1, ...utmSources.map((r) => r.orders_count));
  const maxCountryOrders = Math.max(1, ...countries.map((r) => r.orders_count));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Acquisition</h2>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as 'all' | 'today' | 'week' | 'month')}
          className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1DB954]"></div>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <div className="text-gray-400 text-sm">Total orders</div>
              <div className="text-3xl font-bold text-white mt-2">{totals.total_orders}</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <div className="text-gray-400 text-sm">Total revenue</div>
              <div className="text-3xl font-bold text-[#1DB954] mt-2">{Number(totals.total_revenue).toFixed(2)} €</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <div className="text-gray-400 text-sm">Unique sources</div>
              <div className="text-3xl font-bold text-white mt-2">{totals.unique_sources}</div>
            </div>
          </div>

          {/* Daily orders timeline */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Orders per day (last 30 days)</h3>
            {dailyDays.length === 0 ? (
              <div className="text-gray-400 text-sm">No data yet.</div>
            ) : (
              <div className="flex items-end space-x-1 h-40">
                {dailyDays.map((day) => {
                  const value = dailyTotals[day];
                  const heightPercent = (value / maxDaily) * 100;
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center justify-end group relative">
                      <div
                        className="w-full bg-gradient-to-t from-[#1DB954] to-emerald-400 rounded-t hover:opacity-80 transition-opacity"
                        style={{ height: `${heightPercent}%`, minHeight: value > 0 ? '4px' : '0' }}
                      />
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        {day}: {value} orders
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Top referring domains */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top referring domains</h3>
              {referringDomains.length === 0 ? (
                <div className="text-gray-400 text-sm">No data yet.</div>
              ) : (
                <div className="space-y-2">
                  {referringDomains.map((row) => (
                    <div key={row.source} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-white truncate max-w-[200px]" title={row.source}>{row.source}</span>
                        <span className="text-gray-400">{row.orders_count} · {Number(row.revenue).toFixed(2)} €</span>
                      </div>
                      <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#1DB954] to-emerald-400"
                          style={{ width: `${(row.orders_count / maxRefOrders) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top UTM sources */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top UTM sources</h3>
              {utmSources.length === 0 ? (
                <div className="text-gray-400 text-sm">No UTM data yet.</div>
              ) : (
                <div className="space-y-2">
                  {utmSources.map((row) => (
                    <div key={row.source} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-white truncate max-w-[200px]" title={row.source}>{row.source}</span>
                        <span className="text-gray-400">{row.orders_count} · {Number(row.revenue).toFixed(2)} €</span>
                      </div>
                      <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                          style={{ width: `${(row.orders_count / maxUtmOrders) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* UTM campaigns table */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/30">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Campaign</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Source</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Medium</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Orders</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {utmCampaigns.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No UTM campaign data yet.</td></tr>
                ) : utmCampaigns.map((row, i) => (
                  <tr key={`${row.campaign}-${row.source}-${i}`} className="hover:bg-gray-700/20">
                    <td className="px-4 py-3 text-white text-sm">{row.campaign}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{row.source}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{row.medium}</td>
                    <td className="px-4 py-3 text-right text-white text-sm">{row.orders_count}</td>
                    <td className="px-4 py-3 text-right text-[#1DB954] text-sm">{Number(row.revenue).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Countries */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Orders by country</h3>
            {countries.length === 0 ? (
              <div className="text-gray-400 text-sm">No data yet.</div>
            ) : (
              <div className="space-y-2">
                {countries.map((row) => (
                  <div key={row.country} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white">
                        {row.country} {COUNTRY_FLAGS[row.country] ? <span className="text-gray-400 ml-2">{COUNTRY_FLAGS[row.country]}</span> : null}
                      </span>
                      <span className="text-gray-400">{row.orders_count} orders · {Number(row.revenue).toFixed(2)} €</span>
                    </div>
                    <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${(row.orders_count / maxCountryOrders) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
