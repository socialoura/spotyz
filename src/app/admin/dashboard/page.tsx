'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import PricingTab from '@/components/admin/PricingTab';
import OrdersTab from '@/components/admin/OrdersTab';
import SettingsTab from '@/components/admin/SettingsTab';
import PromoTab from '@/components/admin/PromoTab';

type TabType = 'pricing' | 'orders' | 'analytics' | 'settings' | 'promo';

export interface Package {
  id: string;
  impressions: number;
  price: number;
  original_price: number;
  discount_percentage: number;
  is_active: boolean;
  description?: string;
}

export interface Order {
  order_id: string;
  email: string;
  youtube_url: string;
  package_id: string;
  impressions: number;
  impressions_delivered: number;
  price: number;
  cost: number;
  status: string;
  notes: string;
  stripe_transaction_id?: string;
  promo_code?: string;
  discount_amount: number;
  created_at: string;
}

export interface PromoCode {
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_purchase: number | null;
  max_uses: number;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
}

export interface GoogleAdsExpense {
  month: string;
  amount: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('pricing');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const toNumber = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const [packages, setPackages] = useState<Package[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [promoFieldEnabled, setPromoFieldEnabled] = useState(true);
  const [googleAdsExpenses, setGoogleAdsExpenses] = useState<GoogleAdsExpense[]>([]);

  const getAuthHeaders = useCallback(() => {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  }, [token]);

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    if (!storedToken) { router.push('/admin'); return; }
    try {
      const decoded = JSON.parse(atob(storedToken));
      if (!decoded.exp || decoded.exp < Date.now() || decoded.role !== 'admin') {
        localStorage.removeItem('adminToken'); router.push('/admin'); return;
      }
      setToken(storedToken);
      setLoading(false);
    } catch { localStorage.removeItem('adminToken'); router.push('/admin'); }
  }, [router]);

  const fetchPricing = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/pricing', { headers: getAuthHeaders() });
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized: Package[] = data.map((pkgUnknown: unknown) => {
          const pkg = pkgUnknown as Partial<Package> & Record<string, unknown>;
          return {
            ...(pkg as Package),
            impressions: Number(pkg.impressions ?? 0),
            price: toNumber(pkg.price),
            original_price: toNumber(pkg.original_price),
            discount_percentage: toNumber(pkg.discount_percentage),
            is_active: Boolean(pkg.is_active),
          };
        });
        setPackages(normalized);
      }
    } catch (e) { console.error('Failed to fetch pricing:', e); }
  }, [getAuthHeaders]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders', { headers: getAuthHeaders() });
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized: Order[] = data.map((orderUnknown: unknown) => {
          const order = orderUnknown as Partial<Order> & Record<string, unknown>;
          return {
            ...(order as Order),
            impressions: Number(order.impressions ?? 0),
            impressions_delivered: Number(order.impressions_delivered ?? 0),
            price: toNumber(order.price),
            cost: toNumber(order.cost),
            discount_amount: toNumber(order.discount_amount),
          };
        });
        setOrders(normalized);
      }
    } catch (e) { console.error('Failed to fetch orders:', e); }
  }, [getAuthHeaders]);

  const fetchPromoCodes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/promo-codes', { headers: getAuthHeaders() });
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized: PromoCode[] = data.map((promoUnknown: unknown) => {
          const promo = promoUnknown as Partial<PromoCode> & Record<string, unknown>;
          const minPurchaseRaw = promo.min_purchase;
          return {
            ...(promo as PromoCode),
            discount_value: toNumber(promo.discount_value),
            min_purchase: minPurchaseRaw === null || minPurchaseRaw === undefined ? null : toNumber(minPurchaseRaw),
            max_uses: Number(promo.max_uses ?? -1),
            current_uses: Number(promo.current_uses ?? 0),
            is_active: Boolean(promo.is_active),
          };
        });
        setPromoCodes(normalized);
      }
    } catch (e) { console.error('Failed to fetch promo codes:', e); }
  }, [getAuthHeaders]);

  const fetchPromoFieldEnabled = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/promo-settings', { headers: getAuthHeaders() });
      const data = await res.json();
      setPromoFieldEnabled(data.enabled !== false);
    } catch (e) { console.error('Failed to fetch promo settings:', e); }
  }, [getAuthHeaders]);

  const fetchGoogleAdsExpenses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/google-ads-expenses', { headers: getAuthHeaders() });
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized: GoogleAdsExpense[] = data.map((expenseUnknown: unknown) => {
          const expense = expenseUnknown as Partial<GoogleAdsExpense> & Record<string, unknown>;
          return {
            ...(expense as GoogleAdsExpense),
            amount: toNumber(expense.amount),
          };
        });
        setGoogleAdsExpenses(normalized);
      }
    } catch (e) { console.error('Failed to fetch ads expenses:', e); }
  }, [getAuthHeaders]);

  useEffect(() => {
    if (!token) return;
    if (activeTab === 'pricing') fetchPricing();
    else if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'analytics') { fetchOrders(); fetchPricing(); fetchGoogleAdsExpenses(); }
    else if (activeTab === 'promo') { fetchPromoCodes(); fetchPromoFieldEnabled(); }
  }, [activeTab, token, fetchPricing, fetchOrders, fetchPromoCodes, fetchPromoFieldEnabled, fetchGoogleAdsExpenses]);

  const handleLogout = () => { localStorage.removeItem('adminToken'); router.push('/admin'); };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: JSX.Element }[] = [
    { id: 'pricing', label: 'Pricing', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'orders', label: 'Orders', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { id: 'analytics', label: 'Analytics', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { id: 'settings', label: 'Settings', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { id: 'promo', label: 'Promo Codes', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg> },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800/50 border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-gray-300 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-73px)] bg-gray-800/30 border-r border-gray-700/50 p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-white border border-red-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/30'}`}>
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {activeTab === 'pricing' && <PricingTab packages={packages} token={token!} onRefresh={fetchPricing} />}
          {activeTab === 'orders' && <OrdersTab orders={orders} token={token!} onRefresh={fetchOrders} />}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Analytics & Revenue</h2>
              <AnalyticsDashboard orders={orders} googleAdsExpenses={googleAdsExpenses} token={token!} onRefreshAds={fetchGoogleAdsExpenses} />
            </div>
          )}
          {activeTab === 'settings' && <SettingsTab token={token!} />}
          {activeTab === 'promo' && <PromoTab promoCodes={promoCodes} promoFieldEnabled={promoFieldEnabled} token={token!} onRefresh={fetchPromoCodes} onToggleField={async () => {
            await fetch('/api/admin/promo-settings', { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ enabled: !promoFieldEnabled }) });
            setPromoFieldEnabled(!promoFieldEnabled);
          }} />}
        </main>
      </div>
    </div>
  );
}
