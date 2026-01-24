'use client';

import { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, Loader2, CheckCircle, AlertCircle, Tag } from 'lucide-react';
import StripeProvider from './StripeProvider';

interface PaymentModalProps {
  isOpen: boolean;
  amount: number;
  currency: string;
  onClose: () => void;
  onSuccess?: (paymentIntentId: string, email?: string) => void;
  productName?: string;
  language?: 'en' | 'fr';
  email?: string;
  onPromoApplied?: (discount: number, finalAmount: number, promoCode: string) => void;
}

// Inner component that uses Stripe hooks
function PaymentForm({ 
  amount, 
  currency, 
  onClose, 
  onSuccess,
  productName,
  language = 'en',
  email,
}: Omit<PaymentModalProps, 'isOpen'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [elementsReady, setElementsReady] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Language strings
  const text = {
    en: {
      title: 'Complete Your Payment',
      titleSuccess: 'Payment Successful!',
      processing: 'Processing...',
      loadingForm: 'Loading payment form...',
      paymentComplete: 'Payment Complete!',
      paymentSuccessDesc: 'Your payment has been processed successfully.',
      paymentId: 'Payment ID:',
      payButton: 'Pay',
      cancel: 'Cancel',
      close: 'Close',
      securePayment: 'Secure payment powered by Stripe',
      paymentFailed: 'Payment Failed',
      initializingPayment: 'Initializing secure payment...',
      paymentSetupFailed: 'Payment Setup Failed',
      termsLabel: 'I have read and accept the',
      termsLink: 'terms and conditions',
      safeTransaction: 'Safe Transaction',
      secureEncryption: 'Secure SSL Encryption',
      serviceGuaranteed: 'Service Guaranteed',
    },
    fr: {
      title: 'Finalisez Votre Paiement',
      titleSuccess: 'Paiement Réussi !',
      processing: 'Traitement...',
      loadingForm: 'Chargement du formulaire...',
      paymentComplete: 'Paiement Réussi !',
      paymentSuccessDesc: 'Votre paiement a été traité avec succès.',
      paymentId: 'ID de paiement :',
      payButton: 'Payer',
      cancel: 'Annuler',
      close: 'Fermer',
      securePayment: 'Paiement sécurisé par Stripe',
      paymentFailed: 'Paiement Échoué',
      initializingPayment: 'Initialisation du paiement sécurisé...',
      paymentSetupFailed: 'Échec de la Configuration',
      termsLabel: 'J\'ai lu et j\'accepte les',
      termsLink: 'conditions générales',
      safeTransaction: 'Transaction Sécurisée',
      secureEncryption: 'Chiffrement SSL Sécurisé',
      serviceGuaranteed: 'Service Garanti',
    },
  };

  const t = text[language];

  const formatAmount = (amount: number, currency: string) => {
    const value = amount / 100;
    if (currency.toLowerCase() === 'eur') {
      return `${value.toFixed(2)}€`;
    }
    return `$${value.toFixed(2)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred during payment');
        setPaymentStatus('error');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setPaymentIntentId(paymentIntent.id);
        setPaymentStatus('success');
        
        // Google Ads Conversion Tracking
        if (typeof window !== 'undefined' && (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag) {
          (window as typeof window & { gtag: (...args: unknown[]) => void }).gtag('event', 'conversion', {
            'send_to': 'AW-17898687645/p3uTCO3hjusbEJ2Z4dZC',
            'value': amount / 100,
            'currency': currency.toUpperCase(),
            'transaction_id': paymentIntent.id
          });
        }
        
        if (onSuccess) {
          onSuccess(paymentIntent.id, email);
        }
      }
    } catch {
      setErrorMessage('An unexpected error occurred');
      setPaymentStatus('error');
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (paymentStatus === 'processing') {
      return; // Prevent closing during payment
    }
    onClose();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {paymentStatus === 'success' ? t.titleSuccess : t.title}
        </h2>
        {productName && paymentStatus !== 'success' && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {productName}
          </p>
        )}
        <p className="mt-1 text-lg font-semibold text-indigo-600 dark:text-indigo-400">
          {formatAmount(amount, currency)}
        </p>
      </div>

      {/* Success State */}
      {paymentStatus === 'success' && (
        <div className="text-center py-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t.paymentComplete}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t.paymentSuccessDesc}
          </p>
          {paymentIntentId && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-6 font-mono">
              {t.paymentId} {paymentIntentId}
            </p>
          )}
          <button
            onClick={handleClose}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {t.close}
          </button>
        </div>
      )}

      {/* Error State */}
      {paymentStatus === 'error' && errorMessage && (
        <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 ring-1 ring-red-200 dark:ring-red-800">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {t.paymentFailed}
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form */}
      {paymentStatus !== 'success' && (
        <form onSubmit={handleSubmit}>
          <div className="mb-6 relative min-h-[200px]">
            {!elementsReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="animate-spin h-8 w-8 mx-auto text-indigo-600 dark:text-indigo-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t.loadingForm}
                  </p>
                </div>
              </div>
            )}
            <div className={elementsReady ? 'opacity-100' : 'opacity-0'}>
              <PaymentElement
                onReady={() => setElementsReady(true)}
                options={{
                  layout: 'tabs',
                  wallets: {
                    applePay: 'auto',
                    googlePay: 'auto',
                  },
                }}
              />
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="mb-6 flex items-start">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {t.termsLabel}{' '}
              <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                {t.termsLink}
              </a>
              .
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!stripe || !elements || isProcessing || !elementsReady || !acceptedTerms}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                {t.processing}
              </>
            ) : (
              `${t.payButton} ${formatAmount(amount, currency)}`
            )}
          </button>

          {/* Trust Badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{t.safeTransaction}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>{t.secureEncryption}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{t.serviceGuaranteed}</span>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

// Main modal component
export default function PaymentModal({
  isOpen,
  amount,
  currency,
  onClose,
  onSuccess,
  productName,
  language = 'en',
  email = '',
}: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  
  // Promo code states
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(amount);
  const [promoFieldEnabled, setPromoFieldEnabled] = useState(true);

  // Language strings
  const text = {
    en: {
      initializingPayment: 'Initializing secure payment...',
      paymentSetupFailed: 'Payment Setup Failed',
      close: 'Close',
      promoPlaceholder: 'Enter promo code',
      promoApply: 'Apply',
      promoApplied: 'applied!',
      promoDiscount: 'Discount',
      originalPrice: 'Original price',
      youSave: 'You save',
    },
    fr: {
      initializingPayment: 'Initialisation du paiement sécurisé...',
      paymentSetupFailed: 'Échec de la Configuration',
      close: 'Fermer',
      promoPlaceholder: 'Entrez un code promo',
      promoApply: 'Appliquer',
      promoApplied: 'appliqué !',
      promoDiscount: 'Réduction',
      originalPrice: 'Prix original',
      youSave: 'Vous économisez',
    },
  };

  const t = text[language];

  // Handle promo code validation
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    
    setPromoLoading(true);
    setPromoError(null);
    setPromoSuccess(null);
    
    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, price: amount / 100 }),
      });
      
      const data = await response.json();
      
      if (data.valid) {
        const discountCents = Math.round(data.discount * 100);
        const newAmount = Math.max(amount - discountCents, 50); // Minimum 50 cents
        setDiscount(discountCents);
        setFinalAmount(newAmount);
        setPromoSuccess(`${promoCode.toUpperCase()} ${t.promoApplied}`);
        // Reset client secret to create new payment intent with discounted amount
        setClientSecret(null);
      } else {
        setPromoError(data.error || 'Invalid promo code');
      }
    } catch {
      setPromoError('Error validating promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  // Check if promo field is enabled
  useEffect(() => {
    if (isOpen) {
      fetch('/api/promo-codes/status')
        .then(res => res.json())
        .then(data => setPromoFieldEnabled(data.enabled))
        .catch(() => setPromoFieldEnabled(true));
    }
  }, [isOpen]);

  // Fetch PaymentIntent when modal opens or amount changes
  useEffect(() => {
    if (isOpen && !clientSecret) {
      const createPaymentIntent = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: finalAmount, currency }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to create payment intent');
          }

          setClientSecret(data.clientSecret);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment';
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      };

      createPaymentIntent();
    }
  }, [isOpen, finalAmount, currency, clientSecret]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Delay clearing to allow exit animation
      const timer = setTimeout(() => {
        setClientSecret(null);
        setError(null);
        setIsLoading(false);
        // Reset promo code states
        setPromoCode('');
        setPromoError(null);
        setPromoSuccess(null);
        setDiscount(0);
        setFinalAmount(amount);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle animations
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Trigger animation after render
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      // Remove from DOM after animation
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with fade animation */}
      <div
        className={`fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity duration-300 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleOverlayClick}
      />

      {/* Modal Container with slide and fade animation */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all duration-300 ease-out sm:my-8 sm:w-full sm:max-w-lg ${
            isAnimating 
              ? 'opacity-100 translate-y-0 sm:scale-100' 
              : 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Loading State */}
          {isLoading && (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin h-12 w-12 mx-auto text-indigo-600 dark:text-indigo-400 mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t.initializingPayment}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-6">
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t.paymentSetupFailed}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  {error}
                </p>
                <button
                  onClick={onClose}
                  className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {t.close}
                </button>
              </div>
            </div>
          )}

          {/* Payment Form with Stripe Elements */}
          {!isLoading && !error && clientSecret && (
            <StripeProvider clientSecret={clientSecret}>
              <div className="relative">
                {/* Promo Code Section */}
                {promoFieldEnabled && !promoSuccess && (
                  <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder={t.promoPlaceholder}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          disabled={promoLoading}
                        />
                      </div>
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoCode.trim()}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.promoApply}
                      </button>
                    </div>
                    {promoError && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{promoError}</p>
                    )}
                  </div>
                )}
                
                {/* Promo Applied Banner */}
                {promoSuccess && discount > 0 && (
                  <div className="px-6 py-3 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-700 dark:text-green-400 font-medium">
                        <Tag className="w-4 h-4 inline mr-1" />
                        {promoCode} {t.promoApplied}
                      </span>
                      <div className="text-right">
                        <span className="text-gray-500 line-through mr-2">{(amount / 100).toFixed(2)}€</span>
                        <span className="text-green-700 dark:text-green-400 font-bold">
                          {(finalAmount / 100).toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <PaymentForm
                  amount={finalAmount}
                  currency={currency}
                  onClose={onClose}
                  onSuccess={onSuccess}
                  productName={productName}
                  language={language}
                  email={email}
                />
              </div>
            </StripeProvider>
          )}
        </div>
      </div>
    </div>
  );
}
