'use client';

import { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Order, GoogleAdsExpense } from '@/app/admin/dashboard/page';

interface Props {
  orders: Order[];
  googleAdsExpenses: GoogleAdsExpense[];
  token: string;
  onRefreshAds: () => void;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1'];

export default function AnalyticsDashboard({ orders, googleAdsExpenses, token, onRefreshAds }: Props) {
  const [adsForm, setAdsForm] = useState({ month: '', amount: '' });

  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.price || 0), 0);
    const totalCost = orders.reduce((sum, o) => sum + Number(o.cost || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalImpressions = orders.reduce((sum, o) => sum + (o.impressions || 0), 0);
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const refundedOrders = orders.filter(o => o.status === 'refunded').length;
    const successRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    const refundRate = totalOrders > 0 ? (refundedOrders / totalOrders) * 100 : 0;

    return { totalRevenue, totalCost, totalProfit, totalOrders, avgOrderValue, totalImpressions, successRate, refundRate };
  }, [orders]);

  const last7DaysData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = orders.filter(o => o.created_at.startsWith(dateStr));
      const revenue = dayOrders.reduce((sum, o) => sum + Number(o.price || 0), 0);
      data.push({ name: date.toLocaleDateString('en', { weekday: 'short' }), revenue });
    }
    return data;
  }, [orders]);

  const last30DaysData = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = orders.filter(o => o.created_at.startsWith(dateStr));
      const revenue = dayOrders.reduce((sum, o) => sum + Number(o.price || 0), 0);
      const cost = dayOrders.reduce((sum, o) => sum + Number(o.cost || 0), 0);
      data.push({ name: date.getDate().toString(), revenue, profit: revenue - cost });
    }
    return data;
  }, [orders]);

  const monthlyNetProfit = useMemo(() => {
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthOrders = orders.filter(o => o.created_at.startsWith(monthStr));
      const revenue = monthOrders.reduce((sum, o) => sum + Number(o.price || 0), 0);
      const cost = monthOrders.reduce((sum, o) => sum + Number(o.cost || 0), 0);
      const adsCost = googleAdsExpenses.find(e => e.month === monthStr)?.amount || 0;
      const netProfit = revenue - cost - adsCost;
      data.push({ name: date.toLocaleDateString('en', { month: 'short' }), netProfit, revenue, adsCost });
    }
    return data;
  }, [orders, googleAdsExpenses]);

  const packageDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    orders.forEach(o => {
      const key = `${o.impressions >= 1000 ? (o.impressions / 1000) + 'k' : o.impressions} views`;
      distribution[key] = (distribution[key] || 0) + 1;
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const topPackages = useMemo(() => {
    const pkgRevenue: Record<string, number> = {};
    orders.forEach(o => {
      const key = `${o.impressions >= 1000 ? (o.impressions / 1000) + 'k' : o.impressions}`;
      pkgRevenue[key] = (pkgRevenue[key] || 0) + Number(o.price || 0);
    });
    return Object.entries(pkgRevenue)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, revenue]) => ({ name, revenue }));
  }, [orders]);

  const statusDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    orders.forEach(o => {
      distribution[o.status] = (distribution[o.status] || 0) + 1;
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const handleSaveAdsExpense = async () => {
    if (!adsForm.month || !adsForm.amount) return;
    await fetch('/api/admin/google-ads-expenses', {
      method: 'POST', headers: getAuthHeaders(),
      body: JSON.stringify({ month: adsForm.month, amount: parseFloat(adsForm.amount) }),
    });
    setAdsForm({ month: '', amount: '' });
    onRefreshAds();
  };

  const handleDeleteAdsExpense = async (month: string) => {
    if (!confirm('Delete this expense?')) return;
    await fetch(`/api/admin/google-ads-expenses/${month}`, { method: 'DELETE', headers: getAuthHeaders() });
    onRefreshAds();
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <p className="text-gray-400 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-green-400">{stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <p className="text-gray-400 text-sm">Total Orders</p>
          <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <p className="text-gray-400 text-sm">Avg Order Value</p>
          <p className="text-2xl font-bold text-blue-400">{stats.avgOrderValue.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <p className="text-gray-400 text-sm">Total Profit</p>
          <p className="text-2xl font-bold text-purple-400">{stats.totalProfit.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <p className="text-gray-400 text-sm">Impressions Sold</p>
          <p className="text-2xl font-bold text-red-400">{(stats.totalImpressions / 1000).toFixed(1)}k</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <p className="text-gray-400 text-sm">Success Rate</p>
          <p className="text-xl font-bold text-green-400">{stats.successRate.toFixed(1)}%</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <p className="text-gray-400 text-sm">Refund Rate</p>
          <p className="text-xl font-bold text-red-400">{stats.refundRate.toFixed(1)}%</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <p className="text-gray-400 text-sm">Total Cost</p>
          <p className="text-xl font-bold text-orange-400">{stats.totalCost.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <h3 className="text-white font-semibold mb-4">Revenue Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={last7DaysData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Line type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <h3 className="text-white font-semibold mb-4">Revenue Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={last30DaysData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Bar dataKey="revenue" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <h3 className="text-white font-semibold mb-4">Profit Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={last30DaysData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <h3 className="text-white font-semibold mb-4">Net Profit by Month (incl. Google Ads)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyNetProfit}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Bar dataKey="netProfit" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <h3 className="text-white font-semibold mb-4">Orders by Package</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={packageDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                {packageDistribution.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <h3 className="text-white font-semibold mb-4">Top Selling Packages</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topPackages} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" width={50} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Bar dataKey="revenue" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <h3 className="text-white font-semibold mb-4">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                {statusDistribution.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Google Ads Expenses */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Google Ads Expenses</h3>
        <div className="flex items-end space-x-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Month</label>
            <input type="month" value={adsForm.month} onChange={(e) => setAdsForm({ ...adsForm, month: e.target.value })}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Amount (EUR)</label>
            <input type="number" value={adsForm.amount} onChange={(e) => setAdsForm({ ...adsForm, amount: e.target.value })}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" step="0.01" min="0" />
          </div>
          <button onClick={handleSaveAdsExpense} className="px-4 py-2 bg-gradient-to-r from-[#1DB954] to-emerald-600 rounded-lg text-white hover:from-emerald-600 hover:to-emerald-700">Save</button>
        </div>

        <table className="w-full">
          <thead className="bg-gray-700/30">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Month</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Revenue</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">ROI</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {googleAdsExpenses.map((expense) => {
              const monthRevenue = orders.filter(o => o.created_at.startsWith(expense.month)).reduce((sum, o) => sum + Number(o.price || 0), 0);
              const roi = expense.amount > 0 ? ((monthRevenue - expense.amount) / expense.amount) * 100 : 0;
              return (
                <tr key={expense.month} className="hover:bg-gray-700/20">
                  <td className="px-4 py-3 text-white">{expense.month}</td>
                  <td className="px-4 py-3 text-red-400">{Number(expense.amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-green-400">{monthRevenue.toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={roi >= 0 ? 'text-green-400' : 'text-red-400'}>{roi.toFixed(1)}%</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDeleteAdsExpense(expense.month)} className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              );
            })}
            {googleAdsExpenses.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No expenses recorded</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
