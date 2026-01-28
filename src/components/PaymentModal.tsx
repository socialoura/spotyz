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
  onCollectedDetails?: (details: { email: string; youtubeVideoUrl: string }) => void;
  productName?: string;
  language?: 'en' | 'fr';
  email?: string;
  onPromoApplied?: (discount: number, finalAmount: number, promoCode: string) => void;
  orderDetails?: {
    platform: string;
    followers: number;
    username: string;
  };
}

// Inner component that uses Stripe hooks
function PaymentForm({ 
  amount, 
  originalAmount,
  currency, 
  onClose, 
  onSuccess,
  onCollectedDetails,
  productName,
  language = 'en',
  email,
  promoFieldEnabled = true,
  onApplyPromo,
  promoCode,
  setPromoCode,
  promoLoading,
  promoError,
  promoSuccess,
  discount,
  orderDetails,
}: Omit<PaymentModalProps, 'isOpen'> & {
  originalAmount: number;
  promoFieldEnabled?: boolean;
  onApplyPromo?: () => void;
  promoCode?: string;
  setPromoCode?: (code: string) => void;
  promoLoading?: boolean;
  promoError?: string | null;
  promoSuccess?: string | null;
  discount?: number;
  orderDetails?: {
    platform: string;
    followers: number;
    username: string;
  };
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [elementsReady, setElementsReady] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [customerEmail, setCustomerEmail] = useState(email || '');
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState(orderDetails?.username || '');
  const [detailsError, setDetailsError] = useState<string | null>(null);

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
      serviceGuaranteed: 'Transparent service',
      promoPlaceholder: 'Enter promo code',
      promoApply: 'Apply',
      promoApplied: 'applied!',
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
      serviceGuaranteed: 'Service transparent',
      promoPlaceholder: 'Entrez un code promo',
      promoApply: 'Appliquer',
      promoApplied: 'appliqué !',
    },
  };

  const t = text[language];

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const validateDetails = () => {
    if (!customerEmail.trim() || !isValidEmail(customerEmail)) {
      return language === 'fr' ? 'Veuillez entrer un email valide.' : 'Please enter a valid email.';
    }
    if (!youtubeVideoUrl.trim()) {
      return language === 'fr' ? 'Veuillez entrer le lien de votre vidéo YouTube.' : 'Please enter your YouTube video link.';
    }
    return null;
  };

  const formatAmount = (amount: number, currency: string) => {
    const value = amount / 100;
    if (currency.toLowerCase() === 'eur') {
      return `${value.toFixed(2)}€`;
    }
    return `$${value.toFixed(2)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationMessage = validateDetails();
    if (validationMessage) {
      setDetailsError(validationMessage);
      return;
    }
    setDetailsError(null);

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

        if (onCollectedDetails) {
          onCollectedDetails({ email: customerEmail.trim(), youtubeVideoUrl: youtubeVideoUrl.trim() });
        }
        if (onSuccess) {
          onSuccess(paymentIntent.id, customerEmail.trim());
        }

        // Google Ads Conversion Tracking
        if (typeof window !== 'undefined' && (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag) {
          (window as typeof window & { gtag: (...args: unknown[]) => void }).gtag('event', 'conversion', {
            'send_to': 'AW-17898687645/p3uTCO3hjusbEJ2Z4dZC',
            'value': amount / 100,
            'currency': currency.toUpperCase(),
            'transaction_id': paymentIntent.id
          });
        }

        // Send confirmation email and Discord notification
        if (customerEmail && orderDetails) {
          const orderId = paymentIntent.id.slice(-8).toUpperCase();
          const priceFormatted = formatAmount(amount, currency);
          
          // Send confirmation email
          try {
            await fetch('/api/send-confirmation-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: customerEmail,
                customerName: youtubeVideoUrl,
                orderDetails: {
                  platform: orderDetails.platform,
                  followers: orderDetails.followers,
                  price: priceFormatted,
                  orderId,
                  date: new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }),
                },
                language,
              }),
            });
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
          }

          // Send Discord notification
          try {
            await fetch('/api/discord-notification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                email: customerEmail,
                username: youtubeVideoUrl,
                platform: orderDetails.platform,
                followers: orderDetails.followers,
                price: priceFormatted,
                promoCode: promoCode || undefined,
              }),
            });
          } catch (discordError) {
            console.error('Failed to send Discord notification:', discordError);
          }
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
    <div className="p-6 sm:p-8">
      {/* Header with gradient background */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600 shadow-sm mb-4 border border-red-700/10">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
          {paymentStatus === 'success' ? t.titleSuccess : t.title}
        </h2>
        {productName && paymentStatus !== 'success' && (
          <p className="mt-3 text-sm text-gray-600 bg-gray-50 border border-gray-200 inline-block px-4 py-1.5 rounded-full dark:text-gray-300 dark:bg-gray-900 dark:border-gray-800">
            {productName}
          </p>
        )}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-3xl font-black text-red-600">
            {formatAmount(amount, currency)}
          </span>
          {originalAmount !== amount && (
            <span className="text-lg text-gray-400 line-through dark:text-gray-500">
              {formatAmount(originalAmount, currency)}
            </span>
          )}
        </div>
      </div>

      {/* Success State */}
      {paymentStatus === 'success' && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 shadow-sm mb-6 border border-green-200 dark:bg-green-950/40 dark:border-green-900">
            <CheckCircle className="h-10 w-10 text-green-700 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
            {t.paymentComplete}
          </h3>
          <p className="text-gray-600 mb-6 dark:text-gray-300">
            {t.paymentSuccessDesc}
          </p>
          {paymentIntentId && (
            <p className="text-xs text-gray-600 mb-6 font-mono bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg inline-block dark:text-gray-300 dark:bg-gray-900 dark:border-gray-800">
              {t.paymentId} {paymentIntentId}
            </p>
          )}
          <button
            onClick={handleClose}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 px-6 rounded-xl transition-all shadow-sm"
          >
            {t.close}
          </button>
        </div>
      )}

      {/* Error State */}
      {paymentStatus === 'error' && errorMessage && (
        <div className="mb-6 rounded-2xl bg-red-50 p-5 border border-red-200 dark:bg-red-950/40 dark:border-red-900">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 border border-red-200 flex items-center justify-center dark:bg-red-950/40 dark:border-red-900">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-800 dark:text-red-300">
                {t.paymentFailed}
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-200">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form */}
      {paymentStatus !== 'success' && (
        <form onSubmit={handleSubmit}>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2 dark:text-gray-300">
                {language === 'fr' ? 'Email' : 'Email'}
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => {
                  setCustomerEmail(e.target.value);
                  setDetailsError(null);
                }}
                placeholder={language === 'fr' ? 'vous@exemple.com' : 'you@example.com'}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-medium focus:border-red-600 focus:ring-0 transition-colors dark:border-gray-800 dark:bg-gray-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2 dark:text-gray-300">
                {language === 'fr' ? 'Lien YouTube' : 'YouTube link'}
              </label>
              <input
                type="text"
                value={youtubeVideoUrl}
                onChange={(e) => {
                  setYoutubeVideoUrl(e.target.value);
                  setDetailsError(null);
                }}
                placeholder={language === 'fr' ? 'https://www.youtube.com/watch?v=...' : 'https://www.youtube.com/watch?v=...'}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-medium focus:border-red-600 focus:ring-0 transition-colors dark:border-gray-800 dark:bg-gray-950 dark:text-white"
              />
            </div>
          </div>

          {detailsError && (
            <div className="mb-6 rounded-2xl bg-red-50 p-5 border border-red-200 dark:bg-red-950/40 dark:border-red-900">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 border border-red-200 flex items-center justify-center dark:bg-red-950/40 dark:border-red-900">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-red-800 dark:text-red-300">
                    {language === 'fr' ? 'Informations requises' : 'Required information'}
                  </h3>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-200">
                    {detailsError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Element Container */}
          <div className="mb-6 relative min-h-[200px] rounded-2xl p-5 border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            {!elementsReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 border border-gray-200 mb-3 dark:bg-gray-900 dark:border-gray-800">
                    <Loader2 className="animate-spin h-6 w-6 text-gray-700" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
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

          {/* Promo Code Section */}
          {promoFieldEnabled && !promoSuccess && setPromoCode && onApplyPromo && (
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2 dark:text-gray-300">
                {t.promoPlaceholder}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={promoCode || ''}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="PROMO20"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm font-medium focus:border-red-600 focus:ring-0 transition-colors dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    disabled={promoLoading}
                  />
                </div>
                <button
                  type="button"
                  onClick={onApplyPromo}
                  disabled={promoLoading || !promoCode?.trim()}
                  className="px-5 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:shadow-none dark:disabled:bg-gray-800"
                >
                  {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.promoApply}
                </button>
              </div>
              {promoError && (
                <p className="mt-2 text-sm text-red-700 flex items-center gap-1 dark:text-red-200">
                  <AlertCircle className="w-4 h-4" />
                  {promoError}
                </p>
              )}
            </div>
          )}

          {/* Promo Applied Banner */}
          {promoSuccess && discount && discount > 0 && (
            <div className="mb-5 p-4 bg-green-50 rounded-xl border border-green-200 dark:bg-green-950/40 dark:border-green-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center dark:bg-green-950/40 dark:border-green-900">
                    <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-400" />
                  </div>
                  <span className="text-green-800 font-bold dark:text-green-200">
                    {promoCode} {t.promoApplied}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 line-through text-sm mr-2 dark:text-gray-500">{formatAmount(originalAmount, currency)}</span>
                  <span className="text-green-800 font-black text-lg dark:text-green-200">
                    {formatAmount(amount, currency)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Terms Checkbox */}
          <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
            <label className="flex items-start cursor-pointer group">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded-md bg-white dark:border-gray-700 dark:bg-gray-950"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors dark:text-gray-200 dark:group-hover:text-white">
                {t.termsLabel}{' '}
                <a href="#" className="text-red-600 hover:underline font-bold">
                  {t.termsLink}
                </a>
                .
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!stripe || !elements || isProcessing || !elementsReady || !acceptedTerms || !!validateDetails()}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black py-4 px-6 rounded-xl transition-all shadow-sm disabled:shadow-none flex items-center justify-center text-lg dark:disabled:bg-gray-800"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                {t.processing}
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {t.payButton} {formatAmount(amount, currency)}
              </>
            )}
          </button>

          {/* Trust Badges */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-center gap-4 sm:gap-8 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-green-100 border border-green-200 flex items-center justify-center dark:bg-green-950/40 dark:border-green-900">
                  <svg className="h-3.5 w-3.5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">{t.safeTransaction}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center dark:bg-blue-950/40 dark:border-blue-900">
                  <svg className="h-3.5 w-3.5 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">{t.secureEncryption}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center dark:bg-gray-900 dark:border-gray-800">
                  <svg className="h-3.5 w-3.5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">{t.serviceGuaranteed}</span>
              </div>
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
  orderDetails,
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
    },
    fr: {
      initializingPayment: 'Initialisation du paiement sécurisé...',
      paymentSetupFailed: 'Échec de la Configuration',
      close: 'Fermer',
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
        setPromoSuccess(`${promoCode.toUpperCase()}`);
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
  }, [isOpen, amount]);

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
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleOverlayClick}
      />

      {/* Modal Container with slide and fade animation */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`relative transform overflow-hidden rounded-3xl bg-white border border-gray-200 text-left shadow-xl transition-all duration-300 ease-out sm:my-8 sm:w-full sm:max-w-lg dark:bg-gray-950 dark:border-gray-800 ${
            isAnimating 
              ? 'opacity-100 translate-y-0 sm:scale-100' 
              : 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors z-10 dark:text-gray-400 dark:hover:text-white"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Loading State */}
          {isLoading && (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin h-12 w-12 mx-auto text-gray-700 mb-4 dark:text-gray-200" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t.initializingPayment}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-6">
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-16 w-16 text-red-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {t.paymentSetupFailed}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  {error}
                </p>
                <button
                  onClick={onClose}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-colors"
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
                amount={finalAmount}
                originalAmount={amount}
                currency={currency}
                onClose={onClose}
                onSuccess={onSuccess}
                productName={productName}
                language={language}
                email={email}
                promoFieldEnabled={promoFieldEnabled}
                onApplyPromo={handleApplyPromo}
                promoCode={promoCode}
                setPromoCode={setPromoCode}
                promoLoading={promoLoading}
                promoError={promoError}
                promoSuccess={promoSuccess}
                discount={discount}
                orderDetails={orderDetails}
              />
            </StripeProvider>
          )}
        </div>
      </div>
    </div>
  );
}
