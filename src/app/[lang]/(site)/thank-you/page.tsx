'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Language } from '@/i18n/config';
import { CheckCircle2, Download, Mail, Clock, Shield, ArrowRight, Copy, Check, Play } from 'lucide-react';

interface PageProps {
  params: { lang: string };
}

export default function ThankYouPage({ params }: PageProps) {
  const lang = params.lang as Language;
  const searchParams = useSearchParams();
  
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  // Get order details from URL params
  const paymentId = searchParams.get('payment_id') || '';
  const orderId = paymentId.slice(-8).toUpperCase();
  const email = searchParams.get('email') || '';
  const views = searchParams.get('views') || '0';
  const amount = searchParams.get('amount') || '0';
  const videoUrl = searchParams.get('video') || '';

  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || '';
  const googleAdsConversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL || '';

  const purchaseValue = useMemo(() => {
    const cents = parseInt(amount);
    if (!Number.isFinite(cents)) return 0;
    return cents / 100;
  }, [amount]);

  // Format amount
  const formattedAmount = (parseInt(amount) / 100).toFixed(2) + '€';
  const formattedViews = parseInt(views).toLocaleString();

  // Hide confetti after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!googleAdsId || !googleAdsConversionLabel) return;
    if (!paymentId) return;
    const w = window as unknown as {
      gtag?: (...args: any[]) => void;
    };
    if (typeof w.gtag !== 'function') return;

    w.gtag('event', 'conversion', {
      send_to: `${googleAdsId}/${googleAdsConversionLabel}`,
      value: purchaseValue,
      currency: 'EUR',
      transaction_id: paymentId,
    });
  }, [googleAdsId, googleAdsConversionLabel, paymentId, purchaseValue]);

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const content = {
    en: {
      title: 'Payment Successful!',
      subtitle: 'Thank you for your order. Your campaign is being set up.',
      orderDetails: 'Order Details',
      orderId: 'Order ID',
      email: 'Email',
      package: 'Package',
      views: 'views',
      total: 'Total Paid',
      videoUrl: 'Video URL',
      whatNext: 'What happens next?',
      steps: [
        {
          icon: Clock,
          title: 'Campaign Setup',
          description: 'Our team is configuring your visibility campaign. This usually takes 1-2 hours.',
        },
        {
          icon: Play,
          title: 'Progressive Delivery',
          description: 'Views are delivered gradually over 24-72 hours for natural distribution.',
        },
        {
          icon: Mail,
          title: 'Email Updates',
          description: 'You\'ll receive status updates at your email address.',
        },
      ],
      confirmationSent: 'A confirmation email has been sent to',
      backHome: 'Back to Home',
      support: 'Need help? Contact us at',
      guarantee: 'Satisfaction Guaranteed',
      guaranteeText: 'If you have any issues with your order, our support team is here to help.',
    },
    fr: {
      title: 'Paiement Réussi !',
      subtitle: 'Merci pour votre commande. Votre campagne est en cours de configuration.',
      orderDetails: 'Détails de la Commande',
      orderId: 'N° de commande',
      email: 'Email',
      package: 'Pack',
      views: 'vues',
      total: 'Total Payé',
      videoUrl: 'URL de la vidéo',
      whatNext: 'Et maintenant ?',
      steps: [
        {
          icon: Clock,
          title: 'Configuration',
          description: 'Notre équipe configure votre campagne de visibilité. Cela prend généralement 1-2 heures.',
        },
        {
          icon: Play,
          title: 'Livraison Progressive',
          description: 'Les vues sont livrées progressivement sur 24-72 heures pour une distribution naturelle.',
        },
        {
          icon: Mail,
          title: 'Mises à Jour',
          description: 'Vous recevrez des mises à jour par email.',
        },
      ],
      confirmationSent: 'Un email de confirmation a été envoyé à',
      backHome: 'Retour à l\'Accueil',
      support: 'Besoin d\'aide ? Contactez-nous à',
      guarantee: 'Satisfaction Garantie',
      guaranteeText: 'Si vous avez un problème avec votre commande, notre équipe support est là pour vous aider.',
    },
  };

  const t = content[lang] || content.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#FF0000', '#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'][Math.floor(Math.random() * 6)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30 mb-6 animate-bounce-slow">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Order Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-8">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5" />
                {t.orderDetails}
              </h2>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5">
                <span className="text-white/80 text-sm">{t.orderId}:</span>
                <span className="text-white font-bold">{orderId}</span>
                <button
                  onClick={copyOrderId}
                  className="ml-1 p-1 hover:bg-white/20 rounded transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-300" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/80" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Left Column - Order Info */}
              <div className="space-y-4">
                {email && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t.email}</p>
                      <p className="font-semibold text-gray-900 dark:text-white break-all">{email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                    <Play className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.package}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formattedViews} {t.views}
                    </p>
                  </div>
                </div>

                {videoUrl && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t.videoUrl}</p>
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {videoUrl}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Total */}
              <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t.total}</p>
                <p className="text-4xl font-black text-red-600">{formattedAmount}</p>
                <div className="mt-3 flex items-center gap-1.5 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {lang === 'fr' ? 'Paiement confirmé' : 'Payment confirmed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Email Confirmation Notice */}
            {email && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
                <Mail className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  {t.confirmationSent} <strong>{email}</strong>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* What Happens Next */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-600" />
            {t.whatNext}
          </h3>
          
          <div className="grid sm:grid-cols-3 gap-6">
            {t.steps.map((step, index) => (
              <div key={index} className="relative">
                {index < t.steps.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700" style={{ width: '50%' }} />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-4 shadow-lg shadow-red-500/20">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">{step.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white">{t.guarantee}</h4>
            <p className="text-sm text-white/80">{t.guaranteeText}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/20"
          >
            {t.backHome}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Support Footer */}
        <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          {t.support}{' '}
          <a href="mailto:support@view-plex.com" className="text-red-600 hover:underline font-medium">
            support@view-plex.com
          </a>
        </p>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 4s ease-out forwards;
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
