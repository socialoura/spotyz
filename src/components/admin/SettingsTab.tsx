'use client';

import { useState, useEffect } from 'react';

interface Props {
  token: string;
}

interface ServiceSettings {
  deliverySpeed: 'slow' | 'normal' | 'fast';
  autoComplete: boolean;
  emailNotifications: boolean;
  adminEmail: string;
}

export default function SettingsTab({ token }: Props) {
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', repeatPassword: '' });
  const [stripeSettings, setStripeSettings] = useState({ secretKey: '', publishableKey: '', connected: false });
  const [serviceSettings, setServiceSettings] = useState<ServiceSettings>({
    deliverySpeed: 'normal', autoComplete: false, emailNotifications: true, adminEmail: ''
  });

  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });

  useEffect(() => {
    fetchStripeSettings();
    fetchServiceSettings();
  }, []);

  const fetchStripeSettings = async () => {
    try {
      const res = await fetch('/api/admin/stripe-settings', { headers: getAuthHeaders() });
      const data = await res.json();
      setStripeSettings(data);
    } catch (e) { console.error('Failed to fetch stripe settings:', e); }
  };

  const fetchServiceSettings = async () => {
    try {
      const res = await fetch('/api/admin/service-settings', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data) setServiceSettings(data);
    } catch (e) { console.error('Failed to fetch service settings:', e); }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.repeatPassword) { alert('Passwords do not match'); return; }
    if (passwordForm.newPassword.length < 8) { alert('Password must be at least 8 characters'); return; }
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
      });
      const data = await res.json();
      if (data.success) { alert('Password changed successfully'); setPasswordForm({ currentPassword: '', newPassword: '', repeatPassword: '' }); }
      else alert(data.error || 'Failed to change password');
    } catch (e) { console.error('Failed to change password:', e); }
  };

  const handleSaveStripeSettings = async () => {
    try {
      await fetch('/api/admin/stripe-settings', { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(stripeSettings) });
      alert('Stripe settings saved');
      fetchStripeSettings();
    } catch (e) { console.error('Failed to save stripe settings:', e); }
  };

  const handleTestStripeConnection = async () => {
    try {
      const res = await fetch('/api/admin/stripe-settings/test', { method: 'POST', headers: getAuthHeaders() });
      const data = await res.json();
      alert(data.success ? 'Stripe connection successful!' : 'Stripe connection failed: ' + data.error);
      fetchStripeSettings();
    } catch (e) { console.error('Failed to test stripe:', e); }
  };

  const handleSaveServiceSettings = async () => {
    try {
      await fetch('/api/admin/service-settings', { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(serviceSettings) });
      alert('Service settings saved');
    } catch (e) { console.error('Failed to save service settings:', e); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Settings</h2>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Current Password</label>
            <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">New Password</label>
            <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Repeat Password</label>
            <input type="password" value={passwordForm.repeatPassword} onChange={(e) => setPasswordForm({ ...passwordForm, repeatPassword: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
          </div>
        </div>
        <button onClick={handleChangePassword} className="mt-4 px-4 py-2 bg-gradient-to-r from-[#1DB954] to-emerald-600 rounded-lg text-white hover:from-emerald-600 hover:to-emerald-700">
          Update Password
        </button>
      </div>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Stripe API Keys</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Secret Key</label>
            <input type="password" value={stripeSettings.secretKey} onChange={(e) => setStripeSettings({ ...stripeSettings, secretKey: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="sk_..." />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Publishable Key</label>
            <input type="text" value={stripeSettings.publishableKey} onChange={(e) => setStripeSettings({ ...stripeSettings, publishableKey: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="pk_..." />
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={handleTestStripeConnection} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">Test Connection</button>
            <button onClick={handleSaveStripeSettings} className="px-4 py-2 bg-gradient-to-r from-[#1DB954] to-emerald-600 rounded-lg text-white hover:from-emerald-600 hover:to-emerald-700">Save</button>
            <span className={`flex items-center space-x-2 ${stripeSettings.connected ? 'text-green-400' : 'text-gray-400'}`}>
              {stripeSettings.connected ? (
                <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg><span>Connected</span></>
              ) : (
                <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg><span>Not Connected</span></>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Service Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Default Delivery Speed</label>
            <select value={serviceSettings.deliverySpeed} onChange={(e) => setServiceSettings({ ...serviceSettings, deliverySpeed: e.target.value as 'slow' | 'normal' | 'fast' })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
              <option value="slow">Slow (7-14 days)</option>
              <option value="normal">Normal (3-7 days)</option>
              <option value="fast">Fast (24-72h)</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white">Auto-Complete Orders</span>
              <p className="text-sm text-gray-400">Auto-complete when impressions delivered = total</p>
            </div>
            <button onClick={() => setServiceSettings({ ...serviceSettings, autoComplete: !serviceSettings.autoComplete })}
              className={`relative w-12 h-6 rounded-full transition-colors ${serviceSettings.autoComplete ? 'bg-green-500' : 'bg-gray-600'}`}>
              <span className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${serviceSettings.autoComplete ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white">Email Notifications</span>
              <p className="text-sm text-gray-400">New orders, completion, low balance alerts</p>
            </div>
            <button onClick={() => setServiceSettings({ ...serviceSettings, emailNotifications: !serviceSettings.emailNotifications })}
              className={`relative w-12 h-6 rounded-full transition-colors ${serviceSettings.emailNotifications ? 'bg-green-500' : 'bg-gray-600'}`}>
              <span className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${serviceSettings.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Admin Email</label>
            <input type="email" value={serviceSettings.adminEmail} onChange={(e) => setServiceSettings({ ...serviceSettings, adminEmail: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="admin@example.com" />
          </div>
          <button onClick={handleSaveServiceSettings} className="px-4 py-2 bg-gradient-to-r from-[#1DB954] to-emerald-600 rounded-lg text-white hover:from-emerald-600 hover:to-emerald-700">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
