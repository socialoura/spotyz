'use client';

import { useState } from 'react';
import { Package } from '@/app/admin/dashboard/page';

interface Props {
  packages: Package[];
  token: string;
  onRefresh: () => void;
}

export default function PricingTab({ packages, token, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [form, setForm] = useState({ impressions: '', price: '', originalPrice: '', isActive: true, description: '' });

  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });

  const formatImpressions = (n: number) => n >= 1000 ? (n / 1000) + 'k' : n.toString();
 
   const asNumber = (value: unknown) => {
     if (typeof value === 'number') return value;
     if (typeof value === 'string') {
       const parsed = Number.parseFloat(value);
       return Number.isFinite(parsed) ? parsed : 0;
     }
     return 0;
   };

  const handleSave = async () => {
    const body = {
      impressions: parseInt(form.impressions),
      price: parseFloat(form.price),
      originalPrice: parseFloat(form.originalPrice),
      isActive: form.isActive,
      description: form.description,
    };

    if (editing) {
      await fetch('/api/admin/pricing', { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ id: editing.id, ...body }) });
    } else {
      await fetch('/api/admin/pricing', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(body) });
    }

    setShowModal(false);
    setEditing(null);
    setForm({ impressions: '', price: '', originalPrice: '', isActive: true, description: '' });
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this package?')) return;
    await fetch(`/api/admin/pricing?id=${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    onRefresh();
  };

  const handleEdit = (pkg: Package) => {
    setEditing(pkg);
    setForm({
      impressions: pkg.impressions.toString(),
      price: pkg.price.toString(),
      originalPrice: pkg.original_price.toString(),
      isActive: pkg.is_active,
      description: pkg.description || '',
    });
    setShowModal(true);
  };

  const handleDuplicate = (pkg: Package) => {
    setEditing(null);
    setForm({
      impressions: (pkg.impressions + 100).toString(),
      price: pkg.price.toString(),
      originalPrice: pkg.original_price.toString(),
      isActive: true,
      description: pkg.description || '',
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Pricing & Packages</h2>
        <button onClick={() => { setEditing(null); setForm({ impressions: '', price: '', originalPrice: '', isActive: true, description: '' }); setShowModal(true); }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#1DB954] to-emerald-600 rounded-lg text-white hover:from-emerald-600 hover:to-emerald-700 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span>New Package</span>
        </button>
      </div>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700/30">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Impressions</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Price (EUR)</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Original (EUR)</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Discount</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {packages.map((pkg) => (
              <tr key={pkg.id} className="hover:bg-gray-700/20">
                <td className="px-6 py-4 text-white font-medium">{formatImpressions(pkg.impressions)} views</td>
                <td className="px-6 py-4 text-green-400">{asNumber(pkg.price).toFixed(2)}</td>
                <td className="px-6 py-4 text-gray-400 line-through">{asNumber(pkg.original_price).toFixed(2)}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm">-{asNumber(pkg.discount_percentage)}%</span></td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-lg text-sm ${pkg.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{pkg.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button onClick={() => handleEdit(pkg)} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                    <button onClick={() => handleDuplicate(pkg)} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                    <button onClick={() => handleDelete(pkg.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">{editing ? 'Edit Package' : 'New Package'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Impressions</label>
                <input type="number" value={form.impressions} onChange={(e) => setForm({ ...form, impressions: e.target.value })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="e.g. 1000" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Price (EUR)</label>
                <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="e.g. 2.49" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Original Price (EUR)</label>
                <input type="number" step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="e.g. 7.99" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description (optional)</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Active</span>
                <button onClick={() => setForm({ ...form, isActive: !form.isActive })} className={`relative w-12 h-6 rounded-full transition-colors ${form.isActive ? 'bg-green-500' : 'bg-gray-600'}`}>
                  <span className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-gradient-to-r from-[#1DB954] to-emerald-600 rounded-lg text-white hover:from-emerald-600 hover:to-emerald-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
