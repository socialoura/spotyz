'use client';

import { useState, useEffect, useCallback } from 'react';
import { Order } from '@/app/admin/dashboard/page';

interface Props {
  orders: Order[];
  token: string;
  onRefresh: () => void;
}

export default function OrdersTab({ orders: initialOrders, token, onRefresh }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filters, setFilters] = useState({ search: '', package: 'all', status: 'all', dateRange: 'all' });

  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });

  const formatImpressions = (n: number) => n >= 1000 ? (n / 1000) + 'k' : n.toString();

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    processing: 'bg-blue-500/20 text-blue-400',
    in_progress: 'bg-purple-500/20 text-purple-400',
    completed: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
    refunded: 'bg-gray-500/20 text-gray-400',
  };

  const fetchOrders = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.package !== 'all') params.set('package', filters.package);
    if (filters.dateRange !== 'all') params.set('dateRange', filters.dateRange);
    if (filters.search) params.set('search', filters.search);

    const res = await fetch(`/api/admin/orders?${params.toString()}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (Array.isArray(data)) setOrders(data);
  }, [filters, token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const handleUpdate = async (orderId: string, updates: Record<string, unknown>) => {
    await fetch(`/api/admin/orders/${orderId}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(updates) });
    onRefresh();
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Delete this order?')) return;
    await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE', headers: getAuthHeaders() });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Orders</h2>

      <div className="grid grid-cols-4 gap-4">
        <input type="text" placeholder="Search email or URL..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
        <select value={filters.package} onChange={(e) => setFilters({ ...filters, package: e.target.value })}
          className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500">
          <option value="all">All Packages</option>
          <option value="250">250 views</option>
          <option value="500">500 views</option>
          <option value="1000">1k views</option>
          <option value="2500">2.5k views</option>
          <option value="10000">10k views</option>
          <option value="25000">25k views</option>
          <option value="50000">50k views</option>
          <option value="100000">100k views</option>
          <option value="250000">250k views</option>
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <select value={filters.dateRange} onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
          className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500">
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700/30">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Order ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Client</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">YouTube URL</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Package</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Cost</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Progress</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Date</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {orders.map((order) => (
              <tr key={order.order_id} className="hover:bg-gray-700/20">
                <td className="px-4 py-3 text-white font-mono text-sm">{order.order_id.slice(0, 8)}...</td>
                <td className="px-4 py-3 text-gray-300 text-sm">{order.email}</td>
                <td className="px-4 py-3 text-sm">
                  {order.youtube_url && (
                    <a href={order.youtube_url} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 truncate max-w-[150px] block">
                      {order.youtube_url.slice(0, 30)}...
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-white text-sm">{formatImpressions(order.impressions)} views</td>
                <td className="px-4 py-3 text-green-400 text-sm">{Number(order.price).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <input type="number" value={order.cost || 0} onChange={(e) => handleUpdate(order.order_id, { cost: parseFloat(e.target.value) || 0 })}
                    className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm" step="0.01" min="0" />
                </td>
                <td className="px-4 py-3">
                  <select value={order.status} onChange={(e) => handleUpdate(order.order_id, { status: e.target.value })}
                    className={`px-2 py-1 rounded text-sm ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <input type="number" value={order.impressions_delivered || 0} onChange={(e) => handleUpdate(order.order_id, { impressionsDelivered: parseInt(e.target.value) || 0 })}
                      className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm" min="0" max={order.impressions} />
                    <span className="text-gray-400 text-sm">/ {formatImpressions(order.impressions)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(order.order_id)} className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
