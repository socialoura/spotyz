'use client';

import { useState } from 'react';
import PaymentModal from '@/components/PaymentModal';

export default function PaymentModalDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    amount: number;
    currency: string;
  } | null>(null);

  const plans = [
    {
      id: 'instagram-starter',
      name: 'Instagram Starter',
      amount: 2900,
      currency: 'usd',
      description: 'Perfect for individuals starting their Instagram journey',
    },
    {
      id: 'instagram-pro',
      name: 'Instagram Professional',
      amount: 7900,
      currency: 'usd',
      description: 'For serious Instagram growth',
    },
    {
      id: 'tiktok-creator',
      name: 'TikTok Creator',
      amount: 3900,
      currency: 'usd',
      description: 'Start your TikTok growth journey',
    },
    {
      id: 'tiktok-influencer',
      name: 'TikTok Influencer',
      amount: 9900,
      currency: 'usd',
      description: 'Scale your TikTok presence',
    },
  ];

  const handleOpenModal = (plan: typeof plans[0]) => {
    setSelectedPlan({
      name: plan.name,
      amount: plan.amount,
      currency: plan.currency,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPlan(null), 300); // Reset after animation
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log('Payment successful!', paymentIntentId);
    // You can add additional logic here, like:
    // - Show a success notification
    // - Redirect to a thank you page
    // - Update user subscription status
    // - Send confirmation email
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Payment Modal Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Click any plan to open the payment modal
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 ring-1 ring-gray-200 dark:ring-gray-800 hover:ring-indigo-500 dark:hover:ring-indigo-400 transition-all"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {plan.description}
              </p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">
                {formatCurrency(plan.amount, plan.currency)}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  /month
                </span>
              </p>
              <button
                onClick={() => handleOpenModal(plan)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Subscribe Now
              </button>
            </div>
          ))}
        </div>

        {/* Features Info */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 ring-1 ring-gray-200 dark:ring-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Modal Features
          </h2>
          <ul className="space-y-3 text-gray-600 dark:text-gray-400">
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Modal overlay that prevents page interaction</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Credit card checkout with Apple Pay, Google Pay, and card support</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Loading state while initializing payment</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Processing state during payment confirmation</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Success state with payment confirmation</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Error state with user-friendly messages</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Close on overlay click or close button</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Prevents closing during payment processing</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Dark mode support</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Accessible with proper ARIA attributes</span>
            </li>
          </ul>
        </div>

        {/* Test Card Info */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 ring-1 ring-blue-200 dark:ring-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
            Test Card Numbers
          </h3>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <p><strong>Success:</strong> 4242 4242 4242 4242</p>
            <p><strong>Requires Authentication:</strong> 4000 0025 0000 3155</p>
            <p><strong>Declined:</strong> 4000 0000 0000 9995</p>
            <p className="mt-3 text-xs">Use any future expiration date and any 3-digit CVC</p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={isModalOpen}
          amount={selectedPlan.amount}
          currency={selectedPlan.currency}
          onClose={handleCloseModal}
          onSuccess={handlePaymentSuccess}
          productName={selectedPlan.name}
        />
      )}
    </div>
  );
}
