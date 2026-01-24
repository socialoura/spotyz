'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Save, LogOut, Instagram, Music, AlertCircle, Settings, ShoppingCart, Eye, EyeOff, BarChart3, Search, Filter, MessageSquare, X, ChevronDown, Tag, Percent, Calendar, Hash } from 'lucide-react';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

interface Goal {
  followers: string;
  price: string;
}

interface PricingData {
  instagram: Goal[];
  tiktok: Goal[];
}

interface Order {
  id: number;
  username: string;
  email: string;
  platform: string;
  followers: number;
  price: number;
  payment_status: string;
  payment_intent_id: string | null;
  created_at: string;
  order_status?: string;
  notes?: string;
}

type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

interface DeleteConfirmation {
  isOpen: boolean;
  platform: 'instagram' | 'tiktok' | null;
  index: number | null;
  followers: string;
}

interface OrderDeleteConfirmation {
  isOpen: boolean;
  orderId: number | null;
  username: string;
}

interface PromoCode {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

type TabType = 'pricing' | 'settings' | 'orders' | 'analytics' | 'promo';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('pricing');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pricing, setPricing] = useState<PricingData>({
    instagram: [],
    tiktok: [],
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    repeatPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [showStripeSecretKey, setShowStripeSecretKey] = useState(false);
  const [stripeSettings, setStripeSettings] = useState({
    secretKey: '',
    publishableKey: '',
    hasSecretKey: false,
    hasPublishableKey: false,
  });
  const [message, setMessage] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    isOpen: false,
    platform: null,
    index: null,
    followers: '',
  });
  const [orderDeleteConfirmation, setOrderDeleteConfirmation] = useState<OrderDeleteConfirmation>({
    isOpen: false,
    orderId: null,
    username: '',
  });

  // Order management states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  // Promo codes states
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [promoForm, setPromoForm] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    max_uses: '',
    expires_at: '',
  });
  const [promoDeleteConfirm, setPromoDeleteConfirm] = useState<{ isOpen: boolean; id: number | null; code: string }>({
    isOpen: false,
    id: null,
    code: '',
  });
  const [promoFieldEnabled, setPromoFieldEnabled] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    if (activeTab === 'pricing') {
      fetchPricing();
    } else if (activeTab === 'orders' || activeTab === 'analytics') {
      fetchOrders();
    } else if (activeTab === 'settings') {
      fetchStripeSettings();
      setIsLoading(false);
    } else if (activeTab === 'promo') {
      fetchPromoCodes();
      fetchPromoFieldEnabled();
    } else {
      setIsLoading(false);
    }
  }, [router, activeTab]);

  const fetchPricing = async () => {
    try {
      const response = await fetch('/api/admin/pricing');
      if (response.ok) {
        const data = await response.json();
        setPricing(data);
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStripeSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/stripe-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStripeSettings(data);
      }
    } catch (error) {
      console.error('Error fetching Stripe settings:', error);
    }
  };

  const fetchPromoCodes = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/promo-codes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPromoCodes(data);
      }
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPromoFieldEnabled = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/promo-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPromoFieldEnabled(data.enabled);
      }
    } catch (error) {
      console.error('Error fetching promo field setting:', error);
    }
  };

  const handleTogglePromoField = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/promo-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: !promoFieldEnabled }),
      });
      if (response.ok) {
        setPromoFieldEnabled(!promoFieldEnabled);
        setMessage(promoFieldEnabled ? 'Promo code field disabled' : 'Promo code field enabled');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error toggling promo field:', error);
    }
  };

  const handleCreatePromoCode = async () => {
    if (!promoForm.code || !promoForm.discount_value) {
      setMessage('Code and discount value are required');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: promoForm.code,
          discount_type: promoForm.discount_type,
          discount_value: parseFloat(promoForm.discount_value),
          max_uses: promoForm.max_uses ? parseInt(promoForm.max_uses) : null,
          expires_at: promoForm.expires_at || null,
        }),
      });

      if (response.ok) {
        setMessage('Promo code created successfully!');
        setShowPromoForm(false);
        setPromoForm({ code: '', discount_type: 'percentage', discount_value: '', max_uses: '', expires_at: '' });
        fetchPromoCodes();
      } else {
        const error = await response.json();
        setMessage(error.error || 'Error creating promo code');
      }
    } catch (error) {
      console.error('Error creating promo code:', error);
      setMessage('Error creating promo code');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePromoCode = async () => {
    if (!editingPromo) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/promo-codes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingPromo.id,
          code: promoForm.code,
          discount_type: promoForm.discount_type,
          discount_value: parseFloat(promoForm.discount_value),
          max_uses: promoForm.max_uses ? parseInt(promoForm.max_uses) : null,
          expires_at: promoForm.expires_at || null,
        }),
      });

      if (response.ok) {
        setMessage('Promo code updated successfully!');
        setEditingPromo(null);
        setShowPromoForm(false);
        setPromoForm({ code: '', discount_type: 'percentage', discount_value: '', max_uses: '', expires_at: '' });
        fetchPromoCodes();
      }
    } catch (error) {
      console.error('Error updating promo code:', error);
      setMessage('Error updating promo code');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePromoActive = async (promo: PromoCode) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('/api/admin/promo-codes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: promo.id,
          is_active: !promo.is_active,
        }),
      });
      fetchPromoCodes();
    } catch (error) {
      console.error('Error toggling promo code:', error);
    }
  };

  const handleDeletePromoCode = async () => {
    if (!promoDeleteConfirm.id) return;

    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/admin/promo-codes?id=${promoDeleteConfirm.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setPromoDeleteConfirm({ isOpen: false, id: null, code: '' });
      fetchPromoCodes();
    } catch (error) {
      console.error('Error deleting promo code:', error);
    }
  };

  const openEditPromo = (promo: PromoCode) => {
    setEditingPromo(promo);
    setPromoForm({
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value.toString(),
      max_uses: promo.max_uses?.toString() || '',
      expires_at: promo.expires_at ? promo.expires_at.split('T')[0] : '',
    });
    setShowPromoForm(true);
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/orders/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });

      if (response.ok) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, order_status: newStatus } : order
        ));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Update order notes
  const handleSaveNotes = async (orderId: number) => {
    setUpdatingOrderId(orderId);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/orders/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, notes: tempNotes }),
      });

      if (response.ok) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, notes: tempNotes } : order
        ));
        setEditingNotes(null);
        setTempNotes('');
      }
    } catch (error) {
      console.error('Error updating order notes:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!order.username.toLowerCase().includes(query) && 
          !order.email?.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Platform filter
    if (filterPlatform !== 'all' && order.platform !== filterPlatform) {
      return false;
    }

    // Status filter
    if (filterStatus !== 'all') {
      const orderStatus = order.order_status || 'pending';
      if (orderStatus !== filterStatus) {
        return false;
      }
    }

    // Date filter
    if (filterDateRange !== 'all') {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      
      if (filterDateRange === 'today') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (orderDate < todayStart) return false;
      } else if (filterDateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (orderDate < weekAgo) return false;
      } else if (filterDateRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (orderDate < monthAgo) return false;
      }
    }

    return true;
  });

  const handleAddGoal = (platform: 'instagram' | 'tiktok') => {
    setPricing((prev) => ({
      ...prev,
      [platform]: [...prev[platform], { followers: '', price: '' }],
    }));
  };

  const handleRemoveGoal = (platform: 'instagram' | 'tiktok', index: number) => {
    const goal = pricing[platform][index];
    setDeleteConfirmation({
      isOpen: true,
      platform,
      index,
      followers: goal.followers,
    });
  };

  const confirmDelete = () => {
    if (deleteConfirmation.platform && deleteConfirmation.index !== null) {
      setPricing((prev) => ({
        ...prev,
        [deleteConfirmation.platform!]: prev[deleteConfirmation.platform!].filter((_, i) => i !== deleteConfirmation.index),
      }));
    }
    setDeleteConfirmation({ isOpen: false, platform: null, index: null, followers: '' });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, platform: null, index: null, followers: '' });
  };

  const handleDeleteOrder = (orderId: number, username: string) => {
    setOrderDeleteConfirmation({ isOpen: true, orderId, username });
  };

  const confirmDeleteOrder = async () => {
    if (!orderDeleteConfirmation.orderId) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/orders/delete/${orderDeleteConfirmation.orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove the order from the state
        setOrders(orders.filter(order => order.id !== orderDeleteConfirmation.orderId));
        setMessage('Order deleted successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to delete order');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      setMessage('Error deleting order');
      setTimeout(() => setMessage(''), 3000);
    }

    setOrderDeleteConfirmation({ isOpen: false, orderId: null, username: '' });
  };

  const cancelDeleteOrder = () => {
    setOrderDeleteConfirmation({ isOpen: false, orderId: null, username: '' });
  };

  const handleUpdateGoal = (
    platform: 'instagram' | 'tiktok',
    index: number,
    field: 'followers' | 'price',
    value: string
  ) => {
    setPricing((prev) => ({
      ...prev,
      [platform]: prev[platform].map((goal, i) =>
        i === index ? { ...goal, [field]: value } : goal
      ),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pricing),
      });

      if (response.ok) {
        setMessage('Pricing updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to update pricing');
      }
    } catch (error) {
      console.error('Error saving pricing:', error);
      setMessage('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setMessage('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.repeatPassword) {
      setMessage('All fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.repeatPassword) {
      setMessage('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage('New password must be at least 8 characters');
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setMessage('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', repeatPassword: '' });
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStripeSettingsUpdate = async () => {
    setMessage('');

    if (!stripeSettings.secretKey || !stripeSettings.publishableKey) {
      setMessage('Both Stripe keys are required');
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/stripe-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          secretKey: stripeSettings.secretKey,
          publishableKey: stripeSettings.publishableKey,
        }),
      });

      if (response.ok) {
        setMessage('Stripe settings updated successfully!');
        await fetchStripeSettings();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to update Stripe settings');
      }
    } catch (error) {
      console.error('Error updating Stripe settings:', error);
      setMessage('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your settings and orders</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl shadow-lg ${
              message.includes('success')
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
            } animate-in slide-in-from-top duration-300`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-purple-100 dark:border-purple-900/30">
          <div className="flex flex-col sm:flex-row border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === 'pricing'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Instagram className="w-5 h-5" />
              Social Media Pricing
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Settings className="w-5 h-5" />
              Admin Settings
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === 'orders'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('promo')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === 'promo'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Tag className="w-5 h-5" />
              Promo Codes
            </button>
          </div>
        </div>

        {activeTab === 'pricing' && (
          <>
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-purple-900/30">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <Instagram className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Instagram Pricing
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {pricing.instagram.length} option{pricing.instagram.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddGoal('instagram')}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Add Goal
                </button>
              </div>

              <div className="grid gap-4">
                {pricing.instagram.map((goal, index) => (
                  <div
                    key={index}
                    className="group relative bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-700/50 dark:to-purple-900/10 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                  >
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Followers
                        </label>
                        <input
                          type="text"
                          value={goal.followers}
                          onChange={(e) =>
                            handleUpdateGoal('instagram', index, 'followers', e.target.value)
                          }
                          placeholder="e.g., 100"
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Price (€)
                        </label>
                        <input
                          type="text"
                          value={goal.price}
                          onChange={(e) =>
                            handleUpdateGoal('instagram', index, 'price', e.target.value)
                          }
                          placeholder="e.g., 1.90"
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveGoal('instagram', index)}
                        className="p-3 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all hover:scale-110 group-hover:shadow-md"
                        title="Delete this pricing option"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                {pricing.instagram.length === 0 && (
                  <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <Instagram className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      No pricing goals yet. Click &quot;Add Goal&quot; to create one.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-pink-100 dark:border-pink-900/30">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl shadow-lg">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      TikTok Pricing
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {pricing.tiktok.length} option{pricing.tiktok.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddGoal('tiktok')}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Add Goal
                </button>
              </div>

              <div className="grid gap-4">
                {pricing.tiktok.map((goal, index) => (
                  <div
                    key={index}
                    className="group relative bg-gradient-to-br from-gray-50 to-pink-50/30 dark:from-gray-700/50 dark:to-pink-900/10 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                  >
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Followers
                        </label>
                        <input
                          type="text"
                          value={goal.followers}
                          onChange={(e) =>
                            handleUpdateGoal('tiktok', index, 'followers', e.target.value)
                          }
                          placeholder="e.g., 100"
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Price (€)
                        </label>
                        <input
                          type="text"
                          value={goal.price}
                          onChange={(e) =>
                            handleUpdateGoal('tiktok', index, 'price', e.target.value)
                          }
                          placeholder="e.g., 2.90"
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveGoal('tiktok', index)}
                        className="p-3 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all hover:scale-110 group-hover:shadow-md"
                        title="Delete this pricing option"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                {pricing.tiktok.length === 0 && (
                  <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <Music className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      No pricing goals yet. Click &quot;Add Goal&quot; to create one.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center sticky bottom-8">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-3 px-10 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-size-200 bg-pos-0 hover:bg-pos-100 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 shadow-2xl hover:shadow-purple-500/50 hover:scale-105"
              >
                <Save className="w-6 h-6" />
                {isSaving ? 'Saving Changes...' : 'Save All Changes'}
              </button>
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* Password Change Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-purple-900/30">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Admin Password
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Change your admin password
                  </p>
                </div>
              </div>

            <div className="max-w-md space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Repeat New Password
                </label>
                <div className="relative">
                  <input
                    type={showRepeatPassword ? 'text' : 'password'}
                    value={passwordData.repeatPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, repeatPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Repeat new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={showRepeatPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRepeatPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Saving...' : 'Update Password'}
              </button>
            </div>
          </div>

          {/* Stripe Settings Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-purple-900/30">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Stripe API Keys
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Configure your Stripe payment gateway
                </p>
              </div>
            </div>

            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secret Key
                </label>
                <div className="relative">
                  <input
                    type={showStripeSecretKey ? 'text' : 'password'}
                    value={stripeSettings.secretKey}
                    onChange={(e) => setStripeSettings({ ...stripeSettings, secretKey: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono text-sm"
                    placeholder={stripeSettings.hasSecretKey ? 'sk_****...' : 'sk_test_... or sk_live_...'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowStripeSecretKey(!showStripeSecretKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={showStripeSecretKey ? 'Hide key' : 'Show key'}
                  >
                    {showStripeSecretKey ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Starts with sk_test_ or sk_live_
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Publishable Key
                </label>
                <input
                  type="text"
                  value={stripeSettings.publishableKey}
                  onChange={(e) => setStripeSettings({ ...stripeSettings, publishableKey: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono text-sm"
                  placeholder={stripeSettings.hasPublishableKey ? 'pk_****...' : 'pk_test_... or pk_live_...'}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Starts with pk_test_ or pk_live_
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> These keys will be stored securely in the database and used for all payment transactions. You can find your Stripe API keys in your{' '}
                  <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 dark:hover:text-blue-300">
                    Stripe Dashboard
                  </a>.
                </p>
              </div>

              <button
                onClick={handleStripeSettingsUpdate}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Saving...' : 'Update Stripe Keys'}
              </button>
            </div>
          </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-purple-900/30">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Orders
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {filteredOrders.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search username or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-xl border transition-colors ${
                    showFilters 
                      ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400' 
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Platform</label>
                    <select
                      value={filterPlatform}
                      onChange={(e) => setFilterPlatform(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="all">All Platforms</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Order Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date Range</label>
                    <select
                      value={filterDateRange}
                      onChange={(e) => setFilterDateRange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterPlatform('all');
                        setFilterStatus('all');
                        setFilterDateRange('all');
                      }}
                      className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Username</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Platform</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Followers</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Price</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Order Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Notes</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="py-4 px-4 text-sm text-gray-900 dark:text-white font-medium">#{order.id}</td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-900 dark:text-white">@{order.username}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{order.email || '-'}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {order.platform === 'instagram' ? <Instagram className="w-4 h-4 text-pink-500" /> : <Music className="w-4 h-4 text-cyan-500" />}
                            {order.platform}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">{order.followers.toLocaleString()}</td>
                        <td className="py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">€{Number(order.price).toFixed(2)}</td>
                        <td className="py-4 px-4">
                          <div className="relative">
                            <select
                              value={order.order_status || 'pending'}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                              disabled={updatingOrderId === order.id}
                              className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-medium border-0 cursor-pointer ${
                                (order.order_status || 'pending') === 'completed'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : (order.order_status || 'pending') === 'processing'
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                  : (order.order_status || 'pending') === 'cancelled'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              } ${updatingOrderId === order.id ? 'opacity-50' : ''}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          {editingNotes === order.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={tempNotes}
                                onChange={(e) => setTempNotes(e.target.value)}
                                className="w-32 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                placeholder="Add note..."
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveNotes(order.id)}
                                disabled={updatingOrderId === order.id}
                                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setEditingNotes(null); setTempNotes(''); }}
                                className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingNotes(order.id); setTempNotes(order.notes || ''); }}
                              className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                            >
                              <MessageSquare className="w-3 h-3" />
                              {order.notes ? (
                                <span className="max-w-[100px] truncate">{order.notes}</span>
                              ) : (
                                <span>Add note</span>
                              )}
                            </button>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleDeleteOrder(order.id, order.username)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard orders={orders} totalVisitors={1000} />
        )}

        {activeTab === 'promo' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-purple-900/30">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Promo Codes
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {promoCodes.length} code{promoCodes.length !== 1 ? 's' : ''} total
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingPromo(null);
                  setPromoForm({ code: '', discount_type: 'percentage', discount_value: '', max_uses: '', expires_at: '' });
                  setShowPromoForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                New Promo Code
              </button>
            </div>

            {/* Promo Field Toggle */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Promo Code Field in Payment
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {promoFieldEnabled ? 'Customers can enter promo codes during checkout' : 'Promo code field is hidden from customers'}
                  </p>
                </div>
                <button
                  onClick={handleTogglePromoField}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    promoFieldEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      promoFieldEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Promo Form Modal */}
            {showPromoForm && (
              <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {editingPromo ? 'Edit Promo Code' : 'Create New Promo Code'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Code *
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={promoForm.code}
                        onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                        placeholder="PROMO20"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Discount Type *
                    </label>
                    <select
                      value={promoForm.discount_type}
                      onChange={(e) => setPromoForm({ ...promoForm, discount_type: e.target.value as 'percentage' | 'fixed' })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Discount Value *
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={promoForm.discount_value}
                        onChange={(e) => setPromoForm({ ...promoForm, discount_value: e.target.value })}
                        placeholder={promoForm.discount_type === 'percentage' ? '20' : '5'}
                        min="0"
                        max={promoForm.discount_type === 'percentage' ? '100' : undefined}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {promoForm.discount_type === 'percentage' ? 'Enter a value between 0 and 100' : 'Enter the amount in euros'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Uses (optional)
                    </label>
                    <input
                      type="number"
                      value={promoForm.max_uses}
                      onChange={(e) => setPromoForm({ ...promoForm, max_uses: e.target.value })}
                      placeholder="100"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited uses</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Expiration Date (optional)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={promoForm.expires_at}
                        onChange={(e) => setPromoForm({ ...promoForm, expires_at: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={editingPromo ? handleUpdatePromoCode : handleCreatePromoCode}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : (editingPromo ? 'Update' : 'Create')}
                  </button>
                  <button
                    onClick={() => {
                      setShowPromoForm(false);
                      setEditingPromo(null);
                      setPromoForm({ code: '', discount_type: 'percentage', discount_value: '', max_uses: '', expires_at: '' });
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Promo Codes List */}
            {promoCodes.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No promo codes yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first promo code to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Code</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Discount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Usage</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Expires</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoCodes.map((promo) => (
                      <tr key={promo.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg font-mono font-bold">
                            <Tag className="w-4 h-4" />
                            {promo.code}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `€${promo.discount_value}`}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            {promo.discount_type === 'percentage' ? 'off' : 'discount'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white">{promo.current_uses}</span>
                            <span className="text-gray-500 dark:text-gray-400">/</span>
                            <span className="text-gray-500 dark:text-gray-400">{promo.max_uses || '∞'}</span>
                          </div>
                          {promo.max_uses && (
                            <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                              <div 
                                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                                style={{ width: `${Math.min((promo.current_uses / promo.max_uses) * 100, 100)}%` }}
                              />
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {promo.expires_at ? (
                            <span className={new Date(promo.expires_at) < new Date() ? 'text-red-500' : ''}>
                              {new Date(promo.expires_at).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-gray-400">Never</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleTogglePromoActive(promo)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              promo.is_active
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {promo.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditPromo(promo)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setPromoDeleteConfirm({ isOpen: true, id: promo.id, code: promo.code })}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Promo Delete Confirmation Modal */}
        {promoDeleteConfirm.isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setPromoDeleteConfirm({ isOpen: false, id: null, code: '' })} />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
                  <div className="flex items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                      <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4 mt-0 text-left flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Promo Code</h3>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete <span className="font-bold text-yellow-600">{promoDeleteConfirm.code}</span>? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex gap-3 justify-end">
                  <button
                    onClick={() => setPromoDeleteConfirm({ isOpen: false, id: null, code: '' })}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeletePromoCode}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={cancelDelete} />
            
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
                  <div className="flex items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                      <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4 mt-0 text-left flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Delete Pricing Option
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Are you sure you want to delete the pricing option for{' '}
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {deleteConfirmation.followers} followers
                          </span>
                          ? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={cancelDelete}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-500/50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {orderDeleteConfirmation.isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={cancelDeleteOrder} />
            
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
                  <div className="flex items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                      <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4 mt-0 text-left flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Delete Order
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Are you sure you want to delete the order for{' '}
                          <span className="font-semibold text-gray-900 dark:text-white">
                            @{orderDeleteConfirmation.username}
                          </span>
                          ? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={cancelDeleteOrder}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteOrder}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-500/50"
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
