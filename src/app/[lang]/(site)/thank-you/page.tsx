'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Language } from '@/i18n/config';
import { CheckCircle2, Download, Mail, Clock, Shield, ArrowRight, Copy, Check, Music } from 'lucide-react';

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

  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-17929444405';
  const googleAdsConversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL || 'GDjKCNbTlPIbELW4tuVC';

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
      gtag?: (...args: unknown[]) => void;
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
      views: 'streams',
      total: 'Total Paid',
      videoUrl: 'Track URL',
      whatNext: 'What happens next?',
      steps: [
        {
          icon: Clock,
          title: 'Campaign Setup',
          description: 'Our team is configuring your visibility campaign. This usually takes 1-2 hours.',
        },
        {
          icon: Music,
          title: 'Progressive Delivery',
          description: 'Streams are delivered gradually over 24-72 hours for natural distribution.',
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
      views: 'streams',
      total: 'Total Payé',
      videoUrl: 'URL du titre',
      whatNext: 'Et maintenant ?',
      steps: [
        {
          icon: Clock,
          title: 'Configuration',
          description: 'Notre équipe configure votre campagne de visibilité. Cela prend généralement 1-2 heures.',
        },
        {
          icon: Music,
          title: 'Livraison Progressive',
          description: 'Les streams sont livrés progressivement sur 24-72 heures pour une distribution naturelle.',
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
                  backgroundColor: ['#1DB954', '#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'][Math.floor(Math.random() * 6)],
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
          <div className="bg-gradient-to-r from-[#1DB954] to-emerald-500 px-6 py-5">
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
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <Music className="w-5 h-5 text-[#1DB954] dark:text-emerald-400" />
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
                      <svg className="w-5 h-5 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
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
                <p className="text-4xl font-black text-[#1DB954]">{formattedAmount}</p>
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
            <Clock className="w-5 h-5 text-[#1DB954]" />
            {t.whatNext}
          </h3>
          
          <div className="grid sm:grid-cols-3 gap-6">
            {t.steps.map((step, index) => (
              <div key={index} className="relative">
                {index < t.steps.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700" style={{ width: '50%' }} />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1DB954] to-emerald-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
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
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#1DB954] hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
          >
            {t.backHome}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Support Footer */}
        <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          {t.support}{' '}
          <a href="mailto:support@spotyz.com" className="text-[#1DB954] hover:underline font-medium">
            support@spotyz.com
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
