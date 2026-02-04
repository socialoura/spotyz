'use client';

import { useState } from 'react';
import { PromoCode } from '@/app/admin/dashboard/page';

interface Props {
  promoCodes: PromoCode[];
  promoFieldEnabled: boolean;
  token: string;
  onRefresh: () => void;
  onToggleField: () => void;
}

export default function PromoTab({ promoCodes, promoFieldEnabled, token, onRefresh, onToggleField }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [form, setForm] = useState({
    code: '', discountType: 'percentage' as 'percentage' | 'fixed_amount', discountValue: '',
    minPurchase: '', maxUses: '-1', expiresAt: '', isActive: true
  });

  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });

  const handleSave = async () => {
    const body = {
      code: form.code.toUpperCase(),
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue),
      minPurchase: form.minPurchase ? parseFloat(form.minPurchase) : null,
      maxUses: parseInt(form.maxUses),
      expiresAt: form.expiresAt || null,
      isActive: form.isActive,
    };

    if (editing) {
      await fetch(`/api/admin/promo-codes/${editing.code}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(body) });
    } else {
      await fetch('/api/admin/promo-codes', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(body) });
    }

    setShowModal(false);
    setEditing(null);
    setForm({ code: '', discountType: 'percentage', discountValue: '', minPurchase: '', maxUses: '-1', expiresAt: '', isActive: true });
    onRefresh();
  };

  const handleDelete = async (code: string) => {
    if (!confirm('Delete this promo code?')) return;
    await fetch(`/api/admin/promo-codes/${code}`, { method: 'DELETE', headers: getAuthHeaders() });
    onRefresh();
  };

  const handleEdit = (promo: PromoCode) => {
    setEditing(promo);
    setForm({
      code: promo.code,
      discountType: promo.discount_type,
      discountValue: promo.discount_value.toString(),
      minPurchase: promo.min_purchase?.toString() || '',
      maxUses: promo.max_uses.toString(),
      expiresAt: promo.expires_at ? promo.expires_at.split('T')[0] : '',
      isActive: promo.is_active,
    });
    setShowModal(true);
  };

  const handleDuplicate = (promo: PromoCode) => {
    setEditing(null);
    setForm({
      code: promo.code + '_COPY',
      discountType: promo.discount_type,
      discountValue: promo.discount_value.toString(),
      minPurchase: promo.min_purchase?.toString() || '',
      maxUses: promo.max_uses.toString(),
      expiresAt: '',
      isActive: true,
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Promo Codes</h2>
        <button onClick={() => { setEditing(null); setForm({ code: '', discountType: 'percentage', discountValue: '', minPurchase: '', maxUses: '-1', expiresAt: '', isActive: true }); setShowModal(true); }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg text-white hover:from-red-600 hover:to-pink-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span>New Promo Code</span>
        </button>
      </div>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 flex items-center justify-between">
        <div>
          <span className="text-white font-medium">Enable Promo Field at Checkout</span>
          <p className="text-sm text-gray-400">Show promo code input on the checkout page</p>
        </div>
        <button onClick={onToggleField} className={`relative w-12 h-6 rounded-full transition-colors ${promoFieldEnabled ? 'bg-green-500' : 'bg-gray-600'}`}>
          <span className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${promoFieldEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700/30">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Code</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Value</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Min Purchase</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Max Uses</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Used</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Expires</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {promoCodes.map((promo) => (
              <tr key={promo.code} className="hover:bg-gray-700/20">
                <td className="px-4 py-3 text-white font-mono">{promo.code}</td>
                <td className="px-4 py-3 text-gray-300">{promo.discount_type === 'percentage' ? 'Percentage' : 'Fixed'}</td>
                <td className="px-4 py-3 text-green-400">{promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `${promo.discount_value}`}</td>
                <td className="px-4 py-3 text-gray-400">{promo.min_purchase ? `${promo.min_purchase}` : '-'}</td>
                <td className="px-4 py-3 text-gray-400">{promo.max_uses === -1 ? 'Unlimited' : promo.max_uses}</td>
                <td className="px-4 py-3 text-gray-400">{promo.current_uses}</td>
                <td className="px-4 py-3 text-gray-400">{promo.expires_at ? new Date(promo.expires_at).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-sm ${promo.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{promo.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button onClick={() => handleEdit(promo)} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                    <button onClick={() => handleDuplicate(promo)} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                    <button onClick={() => handleDelete(promo.code)} className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </td>
              </tr>
            ))}
            {promoCodes.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No promo codes found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">{editing ? 'Edit Promo Code' : 'New Promo Code'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Code</label>
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white uppercase" placeholder="e.g. SUMMER20" disabled={!!editing} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Discount Type</label>
                <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as 'percentage' | 'fixed_amount' })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed Amount (EUR)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Discount Value</label>
                <input type="number" step="0.01" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder={form.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 5.00'} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Min Purchase (EUR, optional)</label>
                <input type="number" step="0.01" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="e.g. 10.00" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Max Uses (-1 = unlimited)</label>
                <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Expires At (optional)</label>
                <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
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
              <button onClick={handleSave} className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg text-white hover:from-red-600 hover:to-pink-600">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
