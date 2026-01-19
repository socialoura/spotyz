'use client';

import { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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
    <div className="relative p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
          {paymentStatus === 'success' ? t.titleSuccess : t.title}
        </h2>
        {productName && paymentStatus !== 'success' && (
          <p className="text-sm text-gray-400 mb-2">
            {productName}
          </p>
        )}
        <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {formatAmount(amount, currency)}
        </p>
      </div>

      {/* Success State */}
      {paymentStatus === 'success' && (
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {t.paymentComplete}
          </h3>
          <p className="text-gray-400 mb-4">
            {t.paymentSuccessDesc}
          </p>
          {paymentIntentId && (
            <p className="text-xs text-gray-500 mb-6 font-mono bg-gray-800/50 rounded-lg px-3 py-2 inline-block">
              {t.paymentId} {paymentIntentId.slice(0, 20)}...
            </p>
          )}
          <button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25"
          >
            {t.close}
          </button>
        </div>
      )}

      {/* Error State */}
      {paymentStatus === 'error' && errorMessage && (
        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-400">
                {t.paymentFailed}
              </h3>
              <p className="mt-1 text-sm text-red-300/80">
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
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Loader2 className="animate-spin h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-400">
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
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 h-5 w-5 text-purple-600 focus:ring-purple-500 bg-gray-700 border-gray-600 rounded cursor-pointer"
            />
            <label htmlFor="terms" className="text-sm text-gray-400 cursor-pointer">
              {t.termsLabel}{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300 underline">
                {t.termsLink}
              </a>
              .
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!stripe || !elements || isProcessing || !elementsReady || !acceptedTerms}
            className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] disabled:shadow-none disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                {t.processing}
              </>
            ) : (
              <>
                {t.payButton} {formatAmount(amount, currency)}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>

          {/* Trust Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{t.safeTransaction}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>{t.secureEncryption}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
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

  // Language strings
  const text = {
    en: {
      initializingPayment: 'Initializing secure payment...',
      paymentSetupFailed: 'Payment Setup Failed',
      close: 'Close',
    },
    fr: {
      initializingPayment: 'Initialisation du paiement sécurisé...',
      paymentSetupFailed: 'Échec de la Configuration',
      close: 'Fermer',
    },
  };

  const t = text[language];

  // Fetch PaymentIntent when modal opens
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
            body: JSON.stringify({ amount, currency }),
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
  }, [isOpen, amount, currency, clientSecret]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Delay clearing to allow exit animation
      const timer = setTimeout(() => {
        setClientSecret(null);
        setError(null);
        setIsLoading(false);
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
      {/* Backdrop with blur */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleOverlayClick}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative transform overflow-hidden rounded-3xl bg-gradient-to-b from-gray-900 to-gray-950 text-left shadow-2xl shadow-purple-500/10 transition-all duration-300 ease-out w-full max-w-lg border border-gray-800 ${
            isAnimating 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-4 scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative gradient orbs */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all z-10 backdrop-blur-sm"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Loading State */}
          {isLoading && (
            <div className="relative p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-white" />
              </div>
              <p className="text-gray-400">
                {t.initializingPayment}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="relative p-8">
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {t.paymentSetupFailed}
                </h3>
                <p className="text-gray-400 mb-6">
                  {error}
                </p>
                <button
                  onClick={onClose}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  {t.close}
                </button>
              </div>
            </div>
          )}

          {/* Payment Form with Stripe Elements */}
          {!isLoading && !error && clientSecret && (
            <StripeProvider clientSecret={clientSecret}>
              <PaymentForm
                amount={amount}
                currency={currency}
                onClose={onClose}
                onSuccess={onSuccess}
                productName={productName}
                language={language}
                email={email}
              />
            </StripeProvider>
          )}
        </div>
      </div>
    </div>
  );
}
