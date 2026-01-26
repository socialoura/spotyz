'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';

interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export default function StripeTestPage() {
  const [amount, setAmount] = useState('2000');
  const [currency, setCurrency] = useState('usd');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentIntentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseInt(amount, 10),
          currency: currency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred');
      } else {
        setResult(data);
      }
    } catch {
      setError('Failed to connect to the API');
    } finally {
      setLoading(false);
    }
  };

  const presetAmounts = [
    { label: 'Instagram Starter ($29)', amount: 2900, currency: 'usd' },
    { label: 'Instagram Pro ($79)', amount: 7900, currency: 'usd' },
    { label: 'TikTok Creator ($39)', amount: 3900, currency: 'usd' },
    { label: 'TikTok Influencer ($99)', amount: 9900, currency: 'usd' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Stripe API Test Page
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Test the payment intent creation endpoint
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 ring-1 ring-gray-200 dark:ring-gray-800">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Create Payment Intent
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (in smallest unit, e.g., cents)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="2000"
                  required
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Example: 2000 = $20.00 USD
                </p>
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency (3-letter ISO code)
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="usd">USD - US Dollar</option>
                  <option value="eur">EUR - Euro</option>
                  <option value="gbp">GBP - British Pound</option>
                  <option value="cad">CAD - Canadian Dollar</option>
                  <option value="jpy">JPY - Japanese Yen</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {loading ? 'Creating...' : 'Create Payment Intent'}
              </button>
            </form>

            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Quick Presets:
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {presetAmounts.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setAmount(preset.amount.toString());
                      setCurrency(preset.currency);
                    }}
                    className="text-xs px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Response */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 ring-1 ring-gray-200 dark:ring-gray-800">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              API Response
            </h2>

            {!result && !error && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  Submit the form to see the API response
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-6 ring-1 ring-red-200 dark:ring-red-800">
                <div className="flex items-start">
                  <X className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Error
                    </h3>
                    <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 ring-1 ring-green-200 dark:ring-green-800">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="ml-2 text-sm font-medium text-green-800 dark:text-green-200">
                      Success!
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Payment Intent ID
                    </label>
                    <code className="block w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md text-sm font-mono break-all">
                      {result.paymentIntentId}
                    </code>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Client Secret
                    </label>
                    <code className="block w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md text-sm font-mono break-all">
                      {result.clientSecret}
                    </code>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Response:
                  </h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto text-xs">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-12 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 ring-1 ring-gray-200 dark:ring-gray-800">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            API Documentation
          </h2>
          
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Endpoint</h3>
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                POST /api/create-payment-intent
              </code>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Request Body</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
{`{
  "amount": 2000,
  "currency": "usd"
}`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Environment Setup</h3>
              <p>
                Make sure you have set <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">STRIPE_SECRET_KEY</code> in your <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">.env.local</code> file.
              </p>
              <p className="mt-2">
                Get your test key from: <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Stripe Dashboard</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
